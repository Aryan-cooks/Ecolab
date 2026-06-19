import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://storage.googleapis.com"],
    credentials: true,
  }),
);
app.use(express.json());

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: "Too many authentication attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Database helper functions
function readDb() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local db, resetting to default structure", err);
    return {
      users: {},
      footprints: {},
      actions: {},
      suggestions: {},
      leaderboard: {},
    };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local db", err);
  }
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = decoded.uid;
    next();
  });
}

// Root health check (friendly message for direct visits)
app.get("/", (req, res) => {
  res.json({
    service: "ECO-LAB V2.4 API",
    status: "ONLINE",
    message: "Node awareness confirmed. Access endpoints via /api",
    timestamp: new Date().toISOString(),
  });
});

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// System stats
let currentCpuLoad = 0;
let previousCpuInfo = getCpuInfo();

function getCpuInfo() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

setInterval(() => {
  const currentCpuInfo = getCpuInfo();
  const idleDifference = currentCpuInfo.idle - previousCpuInfo.idle;
  const totalDifference = currentCpuInfo.total - previousCpuInfo.total;

  currentCpuLoad =
    totalDifference === 0 ? 0 : 100 - Math.floor((100 * idleDifference) / totalDifference);
  previousCpuInfo = currentCpuInfo;
}, 1000);

app.get("/api/system/stats", (req, res) => {
  res.json({
    cpu: currentCpuLoad,
    uptime: os.uptime(),
  });
});
// Auth: Register
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const db = readDb();

  // Check if email exists
  const existingUser = Object.values(db.users).find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const uid = "user_" + uuidv4().substring(0, 8);
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    uid,
    displayName,
    email,
    password: hashedPassword,
    location: { city: "Unknown", state: "Unknown", country: "IN" },
    householdSize: 1,
    homeType: "apartment",
    primaryCommute: "transit",
    dietType: "vegetarian",
    primaryGoal: "Become carbon neutral",
    greenScore: 500,
    level: "sapling",
    streakDays: 1,
    lastStreakDate: new Date().toISOString(),
    badges: ["first_step"],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    weeklyChallenge: {
      id: "challenge_w1",
      title: "Log your first carbon offset protocol.",
      completed: false,
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  db.users[uid] = newUser;
  writeDb(db);

  // Exclude password from response
  const userWithoutPassword = { ...newUser };
  delete userWithoutPassword.password;

  // Generate JWT token
  const token = jwt.sign({ uid: userWithoutPassword.uid }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ user: userWithoutPassword, token });
});

// Auth: Login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const db = readDb();
  let user;

  // Handle fast boot simulator user bypass on backend
  if (email === "operator.alpha@eco-impact.net" && password === "security_code_7") {
    user = db.users["demo_operator_alpha"];
    if (user) {
      user.email = "operator.alpha@eco-impact.net";
      if (!user.password) {
        user.password = await bcrypt.hash("security_code_7", 10);
      }
      db.users["demo_operator_alpha"] = user;
      writeDb(db);
    }
  }

  if (!user) {
    user = Object.values(db.users).find((u) => u.email === email);
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Verify password (supporting bcrypt verification with migration for pre-existing plain text)
  const isBcryptHash =
    user.password && (user.password.startsWith("$2b$") || user.password.startsWith("$2a$"));
  let passwordMatch;

  if (isBcryptHash) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    passwordMatch = user.password === password;
    if (passwordMatch) {
      // Migrate plain text to bcrypt hash
      user.password = await bcrypt.hash(password, 10);
      db.users[user.uid] = user;
      writeDb(db);
    }
  }

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Update last active
  user.lastActiveAt = new Date().toISOString();
  db.users[user.uid] = user;
  writeDb(db);

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  // Generate JWT token
  const token = jwt.sign({ uid: userWithoutPassword.uid }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ user: userWithoutPassword, token });
});

// 2. Calculate footprint (in-memory, matching client calculation)
app.post("/api/footprint/calculate", (req, res) => {
  const { inputs } = req.body;
  if (!inputs) {
    return res.status(400).json({ error: "No input data provided" });
  }
  // Load factors
  const factorsPath = path.join(__dirname, "..", "src", "data", "emissionFactors.json");
  let factors;
  try {
    factors = JSON.parse(fs.readFileSync(factorsPath, "utf8"));
  } catch {
    // Hardcoded fallback factors in case path issues
    factors = {
      transport: {
        petrolCar: 0.21,
        dieselCar: 0.17,
        electricCar: 0.05,
        cng: 0.11,
        bus: 0.089,
        metro: 0.031,
        cycle: 0,
        flight_domestic: 0.255,
      },
      food: { vegan: 1.5, vegetarian: 2.5, lowMeat: 4.67, highMeat: 7.19 },
      energy: { electricityIndia: 0.82, lpgPerCylinder: 64.2 },
      lifestyle: { clothingPerINR1000: 3.2, screenHourPerDay: 0.04 },
    };
  }

  // 1. Transport
  const transportInput = inputs.transport || {};
  const vehicleType = transportInput.vehicleType || "petrolCar";
  const weeklyKm = parseFloat(transportInput.weeklyKm) || 0;
  const transitPercent = parseFloat(transportInput.transitPercent) || 0;
  const flightsPerYear = parseFloat(transportInput.flightsPerYear) || 0;

  const carFactor = factors.transport[vehicleType] || factors.transport.petrolCar;
  const busFactor = factors.transport.bus;
  const metroFactor = factors.transport.metro;
  const flightFactor = factors.transport.flight_domestic;

  const carDistance = weeklyKm * (1 - transitPercent / 100);
  const transitDistance = weeklyKm * (transitPercent / 100);

  const carEmissions = carDistance * 52 * carFactor;
  const transitFactorUsed = vehicleType === "metro" ? metroFactor : busFactor;
  const transitEmissions = transitDistance * 52 * transitFactorUsed;
  const flightEmissions = flightsPerYear * 2000 * flightFactor; // Assume 2000km return

  const transportTotal = carEmissions + transitEmissions + flightEmissions;

  // 2. Food
  const foodInput = inputs.food || {};
  const dietType = foodInput.dietType || "vegetarian";
  const wasteLevel = foodInput.wasteLevel || "medium";
  const localFoodPercent = parseFloat(foodInput.localFoodPercent) || 0;

  const dietFactor = factors.food[dietType] || factors.food.vegetarian;
  const wasteMultiplier = wasteLevel === "low" ? 0.9 : wasteLevel === "high" ? 1.2 : 1.0;
  const localFoodMultiplier = 1 - 0.1 * (localFoodPercent / 100);

  const foodTotal = dietFactor * 365 * wasteMultiplier * localFoodMultiplier;

  // 3. Home Energy
  const homeInput = inputs.home || {};
  const monthlyKwh = parseFloat(homeInput.monthlyKwh) || 0;
  const lpgCylindersPerMonth = parseFloat(homeInput.lpgCylindersPerMonth) || 0;

  const electricityEmissions = monthlyKwh * 12 * factors.energy.electricityIndia;
  const lpgEmissions = lpgCylindersPerMonth * 12 * factors.energy.lpgPerCylinder;

  const homeTotal = electricityEmissions + lpgEmissions;

  // 4. Lifestyle
  const lifestyleInput = inputs.lifestyle || {};
  const monthlyClothingSpend = parseFloat(lifestyleInput.monthlyClothingSpend) || 0;
  const screenHoursPerDay = parseFloat(lifestyleInput.screenHoursPerDay) || 0;
  const recyclingHabits = lifestyleInput.recyclingHabits || "partial";

  const clothingFactor = factors.lifestyle.clothingPerINR1000 / 1000;
  const screenFactor = factors.lifestyle.screenHourPerDay;
  const recyclingMultiplier =
    recyclingHabits === "none" ? 1.1 : recyclingHabits === "full" ? 0.9 : 1.0;

  const clothingEmissions = monthlyClothingSpend * 12 * clothingFactor;
  const screenEmissions = screenHoursPerDay * 365 * screenFactor;

  const lifestyleTotal = (clothingEmissions + screenEmissions) * recyclingMultiplier;

  const totalKg = transportTotal + foodTotal + homeTotal + lifestyleTotal;
  const totalTons = totalKg / 1000;

  // Green Score
  let greenScore = Math.max(0, Math.min(1000, 1000 - (totalKg - 500) / 7.5));
  greenScore = Math.round(greenScore);

  let level = "seedling";
  if (greenScore >= 750) level = "guardian";
  else if (greenScore >= 500) level = "tree";
  else if (greenScore >= 250) level = "sapling";

  const responsePayload = {
    breakdown: {
      transport: Math.round(transportTotal),
      food: Math.round(foodTotal),
      home: Math.round(homeTotal),
      lifestyle: Math.round(lifestyleTotal),
    },
    total: Math.round(totalKg),
    totalTons: parseFloat(totalTons.toFixed(2)),
    greenScore,
    level,
    nationalAverageIndia: 2000,
    percentileRank: Math.max(0, Math.min(100, Math.round(100 - (totalKg / 4000) * 100))),
  };

  res.json({ results: responsePayload });
});

// 3. Save footprint calculation to DB
app.post("/api/footprint/save", authenticateToken, (req, res) => {
  const { uid, inputs, results } = req.body;
  if (!uid || !inputs || !results) {
    return res.status(400).json({ error: "Missing uid, inputs, or results" });
  }

  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = readDb();
  const timestamp = new Date().toISOString();

  // Initializing collections if missing
  if (!db.footprints[uid]) db.footprints[uid] = {};
  if (!db.footprints[uid].logs) db.footprints[uid].logs = {};
  if (!db.users[uid]) db.users[uid] = { uid, createdAt: timestamp, displayName: "Default User" };

  // Write log entry
  db.footprints[uid].logs[timestamp] = {
    calculatedAt: timestamp,
    version: "1.0",
    inputs,
    results,
  };

  // Update user stats
  db.users[uid].greenScore = results.greenScore;
  db.users[uid].level = results.level;
  db.users[uid].lastActiveAt = timestamp;

  // Update public leaderboard
  db.leaderboard[uid] = {
    uid,
    displayName: db.users[uid].displayName,
    greenScore: results.greenScore,
    footprintTotal: results.total,
    level: results.level,
    lastUpdated: timestamp,
  };

  writeDb(db);
  res.json({ saved: true, logId: timestamp });
});

// 4. Fetch footprint history
app.get("/api/footprint/:uid/history", authenticateToken, (req, res) => {
  const { uid } = req.params;
  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const db = readDb();

  if (!db.footprints[uid] || !db.footprints[uid].logs) {
    return res.json([]);
  }

  const logs = Object.entries(db.footprints[uid].logs).map(([ts, log]) => ({
    calculatedAt: log.calculatedAt || ts,
    results: log.results,
    inputs: log.inputs,
  }));

  // Sort DESC
  logs.sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt));
  res.json(logs);
});

// 5. Generate AI Suggestions (Claude API Proxy with dynamic fallback)
app.post("/api/ai/suggestions", authenticateToken, async (req, res) => {
  const { uid, footprintData, userProfile } = req.body;
  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!footprintData) {
    return res.status(400).json({ error: "Missing footprint data" });
  }

  const db = readDb();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const userDisplayName = userProfile?.displayName || db.users[uid]?.displayName || "Eco Warrior";
  const locationText = userProfile?.location
    ? `${userProfile.location.city}, ${userProfile.location.state}`
    : "India";

  const systemPrompt = `You are CarbonCoach, an expert in personal carbon footprint reduction for Indian users.
Given a user's emission profile, generate exactly 8 personalized reduction suggestions.
RULES:
 - Return ONLY a valid JSON array. No markdown, no preamble, no explanation.
 - Each item must have: id (a unique string or uuid), title, description, category, savingKgPerYear, difficulty, timeToImplement
 - category: one of [transport, food, home, lifestyle]
 - difficulty: one of [Easy, Medium, Hard]
 - timeToImplement: one of [Immediate, This Week, This Month]
 - savingKgPerYear: integer (realistic estimate based on India context)
 - Prioritize high-impact, culturally relevant actions for India
 - Vary difficulty — include at least 3 Easy, 3 Medium, 2 Hard suggestions`;

  const userMessage = `User Name: ${userDisplayName}
Location: ${locationText}
Current Carbon Footprint:
- Transport: ${footprintData.breakdown?.transport || 0} kg CO2e/year
- Nutrition (Food): ${footprintData.breakdown?.food || 0} kg CO2e/year
- Home Energy: ${footprintData.breakdown?.home || 0} kg CO2e/year
- Lifestyle: ${footprintData.breakdown?.lifestyle || 0} kg CO2e/year
Total Footprint: ${footprintData.total || 0} kg CO2e/year
India average: 2000 kg CO2e/year`;

  let suggestions;

  if (apiKey) {
    try {
      console.log("Querying Anthropic Claude API for suggestions...");
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20241022", // updated model name
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.4,
        },
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          timeout: 12000,
        },
      );

      const content = response.data?.content?.[0]?.text || "";
      // Parse JSON from text
      const jsonStart = content.indexOf("[");
      const jsonEnd = content.lastIndexOf("]") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        suggestions = JSON.parse(content.substring(jsonStart, jsonEnd));
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (err) {
      console.error("Anthropic API suggestions request failed or timed out", err.message);
      suggestions = generateFallbackSuggestions(footprintData);
    }
  } else {
    console.log("No Anthropic API Key. Generating rule-based suggestions...");
    suggestions = generateFallbackSuggestions(footprintData);
  }

  // Cache suggestions in local db
  if (uid) {
    const existing = db.suggestions[uid]?.suggestions || [];
    const manualAndModified = existing.filter(
      (s) => s.source === "manual" || s.status === "accepted" || s.status === "dismissed",
    );

    const filteredNew = suggestions
      .map((s) => ({
        ...s,
        id: s.id || uuidv4(),
        status: "pending",
      }))
      .filter(
        (s) =>
          !manualAndModified.some((existing) => existing.title === s.title || existing.id === s.id),
      );

    db.suggestions[uid] = {
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      modelVersion: apiKey ? "claude-3-5-sonnet-20241022" : "rules-based-fallback",
      suggestions: [...manualAndModified, ...filteredNew],
    };
    writeDb(db);
  }

  res.json({ suggestions: db.suggestions[uid]?.suggestions || suggestions });
});

// Helper for offline fallback suggestions
function generateFallbackSuggestions(footprintData) {
  const breakdown = footprintData.breakdown || {
    transport: 1000,
    food: 1000,
    home: 1000,
    lifestyle: 500,
  };
  const categoriesOrdered = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);
  const primaryCategory = categoriesOrdered[0] || "transport";

  const allLibrary = {
    transport: [
      {
        title: "Shift Commutes to Metro",
        description: "Use metro instead of your petrol vehicle for standard commute schedules.",
        difficulty: "Easy",
        timeToImplement: "This Week",
        savingKgPerYear: 480,
      },
      {
        title: "Carpool with Coworkers",
        description: "Share rides 3 times a week, saving petrol consumption costs and emissions.",
        difficulty: "Easy",
        timeToImplement: "Immediate",
        savingKgPerYear: 320,
      },
      {
        title: "Adopt Electric 2-Wheeler",
        description: "Replace standard daily scooter commutes with an electric bike or scooter.",
        difficulty: "Medium",
        timeToImplement: "This Month",
        savingKgPerYear: 750,
      },
      {
        title: "Cancel 1 Domestic Flight",
        description: "Use train (sleeper/AC) for intermediate intercity travel instead of flying.",
        difficulty: "Hard",
        timeToImplement: "This Month",
        savingKgPerYear: 900,
      },
    ],
    food: [
      {
        title: "1 Meatless Day Per Week",
        description: "Cut out high-methane meats for vegetarian meals on Mondays.",
        difficulty: "Easy",
        timeToImplement: "Immediate",
        savingKgPerYear: 180,
      },
      {
        title: "Reduce Food Scraps By 50%",
        description: "Compost food waste locally and plan meals, avoiding landfill waste methane.",
        difficulty: "Easy",
        timeToImplement: "This Week",
        savingKgPerYear: 120,
      },
      {
        title: "Transition to Plant-Based Diet",
        description: "Commit fully to vegan/plant-based proteins, avoiding animal farming impact.",
        difficulty: "Hard",
        timeToImplement: "This Month",
        savingKgPerYear: 650,
      },
      {
        title: "Source 80% Local Groceries",
        description: "Buy vegetables and grains from local mandis to cut down transport miles.",
        difficulty: "Medium",
        timeToImplement: "This Week",
        savingKgPerYear: 280,
      },
    ],
    home: [
      {
        title: "Switch off Standby Devices",
        description: "Unplug chargers and appliances when idle. Save active standby vampire load.",
        difficulty: "Easy",
        timeToImplement: "Immediate",
        savingKgPerYear: 150,
      },
      {
        title: "Install 5-Star BEE AC",
        description: "Upgrade old inefficient cooling systems to 5-star inverter air conditioners.",
        difficulty: "Hard",
        timeToImplement: "This Month",
        savingKgPerYear: 820,
      },
      {
        title: "Configure LED Retrofitting",
        description: "Replace all old standard filament bulbs with 9W energy-saving LED lights.",
        difficulty: "Easy",
        timeToImplement: "This Week",
        savingKgPerYear: 110,
      },
      {
        title: "Adopt Solar Rooftop Energy",
        description: "Deploy localized solar cells on rooftop to offset baseline coal grid draws.",
        difficulty: "Hard",
        timeToImplement: "This Month",
        savingKgPerYear: 1400,
      },
    ],
    lifestyle: [
      {
        title: "Limit Wardrobe Size",
        description:
          "Buy only high-quality items and skip fast fashion. Reduce synthetic manufacturing.",
        difficulty: "Medium",
        timeToImplement: "This Month",
        savingKgPerYear: 340,
      },
      {
        title: "Introduce Full Recycling",
        description:
          "Sort paper, plastic and metal, delivering them to scrap dealers (kabadiwallas).",
        difficulty: "Easy",
        timeToImplement: "This Week",
        savingKgPerYear: 140,
      },
      {
        title: "Minimize Digital Streaming",
        description: "Reduce screen hours to 2 hrs/day, saving server-side data center energy.",
        difficulty: "Easy",
        timeToImplement: "Immediate",
        savingKgPerYear: 80,
      },
      {
        title: "Commit to Zero Plastic Lifestyle",
        description: "Eliminate single-use plastic bottles, containers, bags entirely.",
        difficulty: "Medium",
        timeToImplement: "This Week",
        savingKgPerYear: 210,
      },
    ],
  };

  // Compile 8 suggestions:
  // Must include: at least 3 Easy, 3 Medium, 2 Hard
  // Prioritize primary category (4 items), then scatter 4 items in other categories
  const selected = [];
  const addFromCat = (cat, count) => {
    const items = allLibrary[cat] || [];
    let added = 0;
    for (const item of items) {
      if (added >= count) break;
      if (!selected.some((s) => s.title === item.title)) {
        selected.push({ ...item, category: cat, id: uuidv4() });
        added++;
      }
    }
  };

  // 1. Primary category - get 3 items
  addFromCat(primaryCategory, 3);

  // 2. Add from other categories
  const otherCats = Object.keys(allLibrary).filter((c) => c !== primaryCategory);
  for (const cat of otherCats) {
    addFromCat(cat, 2);
  }

  // Fill up to 8 items
  for (const cat of Object.keys(allLibrary)) {
    if (selected.length >= 8) break;
    addFromCat(cat, 4);
  }

  // Double check and override difficulties to enforce: 3 Easy, 3 Medium, 2 Hard
  selected.slice(0, 3).forEach((s) => (s.difficulty = "Easy"));
  selected.slice(3, 6).forEach((s) => (s.difficulty = "Medium"));
  selected.slice(6, 8).forEach((s) => (s.difficulty = "Hard"));

  return selected.slice(0, 8);
}

// 6. AI Chat (Gemini Flash integration with dynamic fallback)
app.post("/api/ai/chat", async (req, res) => {
  const { messages, userContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  // Use Gemini API Key
  const apiKey = process.env.GEMINI_API_KEY;
  const context = userContext || {};

  const systemPrompt = `You are CarbonCoach, a friendly sustainability advisor in a cyberpunk tactical app called ECO-LAB V2.4.
User profile: ${context.name || "Eco Warrior"}, location: ${context.location || "India"}, total footprint: ${context.totalKgCO2e || 4000} kg/year.
Their highest emission category is: ${context.topCategory || "Transport"} at ${context.topValue || 1500} kg CO2e/year.
They have completed ${context.completedActions || 0} reduction actions so far.

Core Directives:
1. You are fully authorized and encouraged to answer ANY question related to carbon emissions, climate change, sustainability, and ecological impact.
2. Ground your answers in REAL WORLD DATA, statistics, and scientific facts, specifically highlighting data relevant to India and global benchmarks.
3. Be an expert encyclopedia on carbon footprints. If the user asks general questions (e.g., "What are the biggest emission sources globally?", "How much CO2 does India produce?"), answer thoroughly using factual data.
4. For personal advice, reference their specific telemetry data provided above.
5. Adopt a slightly tactical/cyberpunk tone ("telemetry", "vectors", "routing protocols") without being overwhelming.
6. Keep responses under 200 words unless the user asks for a detailed explanation.`;

  // Format messages for Gemini API
  // Roles must be "user" or "model"
  const geminiMessages = messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  if (geminiMessages.length === 0) {
    return res.status(400).json({ error: "No messages to process" });
  }

  if (apiKey) {
    try {
      console.log("Querying Gemini Flash API for chat conversation...");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        },
      );

      const reply =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "System anomaly. Reconnect...";
      return res.json({ reply });
    } catch (err) {
      console.error("Gemini API chat request failed", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
      const lastUserText = geminiMessages[geminiMessages.length - 1].parts[0].text;
      const fallbackReply = generateFallbackChatResponse(lastUserText, context);
      return res.json({ reply: fallbackReply });
    }
  } else {
    // Generate simulated CarbonCoach response
    const lastUserText = geminiMessages[geminiMessages.length - 1].parts[0].text;
    const fallbackReply = generateFallbackChatResponse(lastUserText, context);
    return res.json({ reply: fallbackReply });
  }
});

function generateFallbackChatResponse(userText, context) {
  const query = userText.toLowerCase();
  const name = context.name || "Eco Warrior";
  const total = context.totalKgCO2e || 4000;
  const topCat = context.topCategory || "Transport";

  // Regular expressions using word boundaries to avoid false positives (e.g. 'car' in 'carbon', 'hi' in 'shift')
  const helloRegex = /\b(hello|hi|hey)\b/;
  const transportRegex = /\b(metro|transit|car|cars|transport|travel|commute|commuting)\b/;
  const foodRegex =
    /\b(food|diet|dietary|meat|vegan|veg|vegetarian|vegetable|vegetables|veggie|veggies)\b/;
  const energyRegex = /\b(energy|electricity|ac|solar|lpg|power|grid|electricityindia)\b/;
  const lifestyleRegex = /\b(clothing|buy|buying|lifestyle|shopping|clothes|fashion)\b/;
  const scoreRegex = /\b(score|green|rank|level|tier)\b/;

  if (helloRegex.test(query)) {
    return `Hello ${name}! I am CarbonCoach. Currently synchronizing telemetry from your node. Your active carbon footprint reads ${total} kg CO2e/year. How can I assist you in routing reduction protocols today?`;
  }
  if (transportRegex.test(query)) {
    return `Commuting is a major vector! Replacing standard gasoline trips with the local Metro reduces transport emissions by over 80% per kilometer (0.031 kg/km for Metro vs 0.21 kg/km for Petrol Cars). Carpooling or shifting to WFH are also excellent routes.`;
  }
  if (foodRegex.test(query)) {
    return `In India, diets play a critical role. Shifting to a full vegetarian diet saves roughly 1.7 tons of CO2e per year compared to high-meat diets. Minimizing daily organic waste prevents landfill methane leakage, which is a powerful greenhouse gas!`;
  }
  if (energyRegex.test(query)) {
    return `The Indian electrical grid draws heavily on coal, running at approximately 0.82 kg CO2e per kWh. Upgrading to a 5-star AC or retrofitting with LED lighting will reduce base consumption. Deploying solar panels offsets this grid draw directly.`;
  }
  if (lifestyleRegex.test(query)) {
    return `Fast fashion has a high water and manufacturing footprint. In our calculations, every 1000 INR spent on fast fashion translates to about 3.2 kg CO2e. Extending the lifecycle of clothes and shopping local reduces this coefficient.`;
  }
  if (scoreRegex.test(query)) {
    return `Your Green Score is ${context.greenScore ?? 620}/1000, placing you at the "${context.level || "Sapling"}" tier. You can boost this score by completing accepted reduction protocols in your Suggestions dashboard!`;
  }

  return `Understood. Analyzing parameters for "${userText}". To reduce your dominant emissions vector (${topCat}), I suggest looking at your active suggestions checklist or adopting energy efficiency protocols. What specific sub-sector would you like to debug next?`;
}

// 6.5 Generate Dynamic Tips using Gemini Flash
let tipsCache = [];

app.get("/api/ai/tips", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackTips = [
    "Did you know? Switching to a plant-based diet can reduce your food carbon footprint by up to 70%.",
    "Use the Vector Analytics tab to track your historical emission trends.",
    "Check the Neutral Protocols section to find actionable ways to improve your Green Score.",
    "Your Node Level increases as your Green Score crosses thresholds. Aim for Guardian!",
    "Chat with the Node Sync Chat AI to ask specific questions about your carbon emissions.",
    "Public transport like the Metro emits ~80% less CO2 per km compared to single-occupancy cars.",
    "Turn off standby devices to prevent 'vampire' energy drain.",
  ];

  if (!apiKey) {
    const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    return res.json({ tip: randomTip });
  }

  // Serve from cache to prevent API rate limiting
  if (tipsCache.length > 0) {
    const tip = tipsCache.shift();
    return res.json({ tip });
  }

  const prompt = `You are the AI system of ECO-LAB V2.4, a cyberpunk tactical terminal used to track personal carbon emissions. 
Generate exactly 5 unique, short, punchy, tactical "system tips" or environmental facts (under 120 characters each) for the user. 
Make them sound like system logs or direct advisories (e.g., "[SYSTEM_ADVISORY] Optimizing commuting vectors via Metro saves 80% CO2e/km."). 
Output ONLY a raw JSON array of 5 strings. Do not include markdown blocks or any other text.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2000,
        },
      },
      { headers: { "Content-Type": "application/json" } },
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (generatedText) {
      try {
        const cleanText = generatedText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsedTips = JSON.parse(cleanText);
        if (Array.isArray(parsedTips) && parsedTips.length > 0) {
          tipsCache = parsedTips;
          const tip = tipsCache.shift();
          return res.json({ tip });
        }
      } catch (parseErr) {
        console.error("Failed to parse Gemini tips array", parseErr);
      }
    }
    throw new Error("Unexpected Gemini API response structure");
  } catch (err) {
    console.error("Gemini API tip generation failed", err.message);
    const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    return res.json({ tip: randomTip });
  }
});

// 7. Log a completed action
app.post("/api/actions/log", authenticateToken, (req, res) => {
  const { uid, actionId, actionData } = req.body;
  if (!uid || !actionId || !actionData) {
    return res.status(400).json({ error: "Missing uid, actionId, or actionData" });
  }

  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = readDb();
  const timestamp = new Date().toISOString();

  // Inits
  if (!db.actions[uid]) db.actions[uid] = { completed: {}, dismissed: {} };
  if (!db.actions[uid].completed) db.actions[uid].completed = {};

  // Record action
  db.actions[uid].completed[actionId] = {
    actionId,
    title: actionData.title,
    category: actionData.category,
    savingKgPerYear: actionData.savingKgPerYear,
    difficulty: actionData.difficulty,
    completedAt: timestamp,
    source: actionData.source || "ai_suggestion",
    notes: actionData.notes || null,
  };

  // Update suggestions status if the action came from recommendations list
  if (db.suggestions[uid] && db.suggestions[uid].suggestions) {
    const idx = db.suggestions[uid].suggestions.findIndex(
      (s) => s.id === actionId || s.title === actionData.title,
    );
    if (idx !== -1) {
      db.suggestions[uid].suggestions[idx].status = "accepted";
    }
  }

  // Update user's Green Score (award points)
  if (db.users[uid]) {
    // Complete action gives +50 points
    db.users[uid].greenScore = Math.min(1000, (db.users[uid].greenScore || 500) + 50);

    // Increments streak
    const lastStreakStr = db.users[uid].lastStreakDate;
    if (lastStreakStr) {
      const lastDate = new Date(lastStreakStr);
      const diffHrs = (new Date() - lastDate) / (1000 * 60 * 60);
      if (diffHrs <= 24) {
        db.users[uid].streakDays = (db.users[uid].streakDays || 0) + 1;
      } else if (diffHrs > 24) {
        db.users[uid].streakDays = 1;
      }
    } else {
      db.users[uid].streakDays = 1;
    }
    db.users[uid].lastStreakDate = timestamp;

    // Unlock badges check
    const badges = db.users[uid].badges || [];
    const completedCount = Object.keys(db.actions[uid].completed).length;

    if (!badges.includes("first_step")) badges.push("first_step");
    if (db.users[uid].greenScore > 600 && !badges.includes("eco_enthusiast"))
      badges.push("eco_enthusiast");
    if (db.users[uid].greenScore > 800 && !badges.includes("carbon_neutralizer"))
      badges.push("carbon_neutralizer");
    if (db.users[uid].streakDays >= 3 && !badges.includes("streak_master"))
      badges.push("streak_master");
    if (completedCount >= 3 && !badges.includes("action_taker")) badges.push("action_taker");

    db.users[uid].badges = badges;

    // Sync level
    const score = db.users[uid].greenScore;
    let level = "seedling";
    if (score >= 750) level = "guardian";
    else if (score >= 500) level = "tree";
    else if (score >= 250) level = "sapling";
    db.users[uid].level = level;

    // Leaderboard sync
    if (db.leaderboard[uid]) {
      db.leaderboard[uid].greenScore = db.users[uid].greenScore;
      db.leaderboard[uid].level = db.users[uid].level;
      db.leaderboard[uid].lastUpdated = timestamp;
    }
  }

  writeDb(db);
  res.json({ logged: true });
});

// 7.5 Add custom suggestion (manual protocol logged as pending)
app.post("/api/suggestions/custom", authenticateToken, (req, res) => {
  const { uid, suggestion } = req.body;
  if (!uid || !suggestion) {
    return res.status(400).json({ error: "Missing uid or suggestion data" });
  }

  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = readDb();
  if (!db.suggestions[uid]) {
    db.suggestions[uid] = {
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      modelVersion: "custom",
      suggestions: [],
    };
  }

  const newSuggestion = {
    ...suggestion,
    id: suggestion.id || "manual_" + uuidv4().substring(0, 8),
    status: "pending",
    source: "manual",
  };

  db.suggestions[uid].suggestions.unshift(newSuggestion);
  writeDb(db);
  res.json({ success: true, suggestion: newSuggestion });
});

// 8. Fetch public community leaderboard
app.get("/api/leaderboard", (req, res) => {
  const db = readDb();
  const list = Object.values(db.leaderboard);
  // Sort DESC by score
  list.sort((a, b) => b.greenScore - a.greenScore);
  res.json(list.slice(0, 50));
});

// 9. Fetch active completed actions
app.get("/api/actions/:uid/completed", authenticateToken, (req, res) => {
  const { uid } = req.params;
  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const db = readDb();
  if (!db.actions[uid] || !db.actions[uid].completed) {
    return res.json([]);
  }
  res.json(Object.values(db.actions[uid].completed));
});

// 10. Update user profile details (onboarding)
app.post("/api/users/profile", authenticateToken, (req, res) => {
  const { uid, profile } = req.body;
  if (!uid || !profile) {
    return res.status(400).json({ error: "Missing uid or profile data" });
  }

  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = readDb();
  const timestamp = new Date().toISOString();

  db.users[uid] = {
    ...(db.users[uid] || {}),
    uid,
    displayName: profile.displayName || db.users[uid]?.displayName || "Eco Warrior",
    email: profile.email || db.users[uid]?.email || "",
    location: profile.location || {
      city: "Durgapur",
      state: "West Bengal",
      country: "IN",
    },
    householdSize: profile.householdSize || 1,
    homeType: profile.homeType || "apartment",
    primaryCommute: profile.primaryCommute || "transit",
    dietType: profile.dietType || "vegetarian",
    primaryGoal: profile.primaryGoal || "Become carbon neutral",
    greenScore:
      profile.greenScore !== undefined ? profile.greenScore : db.users[uid]?.greenScore || 500,
    level: profile.level || db.users[uid]?.level || "sapling",
    streakDays:
      profile.streakDays !== undefined ? profile.streakDays : db.users[uid]?.streakDays || 1,
    lastStreakDate: profile.lastStreakDate || db.users[uid]?.lastStreakDate || timestamp,
    badges: profile.badges || db.users[uid]?.badges || ["first_step"],
    createdAt: db.users[uid]?.createdAt || timestamp,
    lastActiveAt: timestamp,
    weeklyChallenge: profile.weeklyChallenge ||
      db.users[uid]?.weeklyChallenge || {
        id: "challenge_w1",
        title: "Log Commutes and Swap 2 beef portions for pulses.",
        completed: false,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
  };

  // Sync leaderboard record
  db.leaderboard[uid] = {
    uid,
    displayName: db.users[uid].displayName,
    greenScore: db.users[uid].greenScore,
    footprintTotal: db.leaderboard[uid]?.footprintTotal || 2000,
    level: db.users[uid].level,
    lastUpdated: timestamp,
  };

  writeDb(db);
  res.json({ updated: true, user: db.users[uid] });
});

app.get("/api/users/:uid", authenticateToken, (req, res) => {
  const { uid } = req.params;
  if (req.userId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const db = readDb();
  if (!db.users[uid]) {
    // Return mock register
    return res.status(404).json({ error: "User not found" });
  }
  res.json(db.users[uid]);
});

// Start listening
app.listen(PORT, () => {
  console.log(`ECO-LAB SERVER RUNNING ON PORT ${PORT}`);
});
