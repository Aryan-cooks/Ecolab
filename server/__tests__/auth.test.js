import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { setTimeout } from "timers/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../db.test.json");
const testPort = 5055;
const baseUrl = `http://localhost:${testPort}`;

process.env.PORT = testPort;
process.env.DB_PATH = dbPath;
process.env.JWT_SECRET = "test_secret_key";

await import("../index.js");
await setTimeout(500); 

describe("Auth Middleware", () => {
  beforeEach(() => {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {}, leaderboard: {} }));
  });

  afterAll(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const validUserA = {
    email: "user_a@test.com",
    password: "password123",
    displayName: "User A"
  };

  const validUserB = {
    email: "user_b@test.com",
    password: "password456",
    displayName: "User B"
  };

  // Helper to generate a random IP to bypass express-rate-limit during tests
  const getRandomIp = () => `10.0.0.${Math.floor(Math.random() * 255)}`;

  it("Register: succeeds with valid fields", async () => {
    const res = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", getRandomIp()).send(validUserA);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("uid");
  });

  it("Register: rejects with 400 on missing fields", async () => {
    const res = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", getRandomIp()).send({ email: "only_email@test.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("Register: rejects with 400 if email already exists", async () => {
    const ip = getRandomIp();
    await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ip).send(validUserA);
    const res = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ip).send(validUserA);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("User with this email already exists");
  });

  it("Login: succeeds with correct credentials and returns a token", async () => {
    const ip = getRandomIp();
    await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ip).send(validUserA);
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .set("X-Forwarded-For", ip)
      .send({ email: validUserA.email, password: validUserA.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Login: rejects with 401 on wrong password", async () => {
    const ip = getRandomIp();
    await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ip).send(validUserA);
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .set("X-Forwarded-For", ip)
      .send({ email: validUserA.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("Login: rejects with 401 on nonexistent email", async () => {
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .set("X-Forwarded-For", getRandomIp())
      .send({ email: "doesnotexist@test.com", password: "password" });
    expect(res.status).toBe(401);
  });

  it("Password hashing: stored password is NOT equal to plain-text password", async () => {
    const res = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", getRandomIp()).send(validUserA);
    const uid = res.body.user.uid;
    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    const storedHash = db.users[uid].password;
    expect(storedHash).not.toBe(validUserA.password);
  });

  it("Middleware - no token: returns 401", async () => {
    const res = await request(baseUrl).get("/api/users/some_uid").set("X-Forwarded-For", getRandomIp());
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("Middleware - invalid token: returns 401", async () => {
    const res = await request(baseUrl)
      .get("/api/users/some_uid")
      .set("X-Forwarded-For", getRandomIp())
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("Middleware - ownership check: User A trying to get User B's data returns 403", async () => {
    const ipA = getRandomIp();
    const ipB = getRandomIp();
    const regA = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ipA).send(validUserA);
    const regB = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ipB).send(validUserB);
    
    const tokenA = regA.body.token;
    const uidB = regB.body.user.uid;

    const res = await request(baseUrl)
      .get(`/api/users/${uidB}`)
      .set("X-Forwarded-For", ipA)
      .set("Authorization", `Bearer ${tokenA}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("Middleware - valid access: User A accessing own data succeeds", async () => {
    const ipA = getRandomIp();
    const regA = await request(baseUrl).post("/api/auth/register").set("X-Forwarded-For", ipA).send(validUserA);
    const tokenA = regA.body.token;
    const uidA = regA.body.user.uid;

    const res = await request(baseUrl)
      .get(`/api/users/${uidA}`)
      .set("X-Forwarded-For", ipA)
      .set("Authorization", `Bearer ${tokenA}`);
    
    expect(res.status).toBe(200);
    expect(res.body.uid).toBe(uidA);
    expect(res.body.email).toBe(validUserA.email);
  });
});
