const axios = require("axios");

async function test() {
  try {
    const res = await axios.post("http://localhost:5000/api/ai/chat", {
      uid: "user_test",
      messages: [
        {
          sender: "user",
          text: "SO TELL ME WHY DO I AS A USER SHOULD USE THIS APP",
        },
      ],
      userContext: {
        name: "Max",
        location: "India",
        totalKgCO2e: 3876,
        topCategory: "Transport",
        topValue: 1500,
        completedActions: 0,
      },
    });
    console.log("REPLY:", res.data.reply);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
