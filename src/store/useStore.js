import { create } from "zustand";
import axios from "axios";
import { calculateFootprint } from "../utils/calculationEngine";

const API_BASE = "http://localhost:5000/api";

// Safe axios wrapper that falls back to mock logic if the server is offline
const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export const useStore = create((set, get) => ({
  user: null,
  footprint: null,
  suggestions: [],
  progress: [],
  actions: [],
  leaderboard: [],
  offlineMode: false,
  isLoading: false,
  error: null,

  // Initialize store state from localStorage (or set default mock user for preview)
  initStore: async () => {
    set({ isLoading: true });
    try {
      // Test server connection
      await api.get("/health");
      set({ offlineMode: false });
    } catch (err) {
      console.log("Backend offline, running in client-only fallback mode.");
      set({ offlineMode: true });
    }

    const savedUser = localStorage.getItem("eco_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      set({ user: parsedUser });

      // Fetch user dependencies
      await get().fetchHistory();
      await get().fetchSuggestions();
      await get().fetchLeaderboard();
      await get().fetchCompletedActions();

      // Load saved footprint if available, otherwise fetch from history
      const savedFootprint = localStorage.getItem("eco_footprint");
      if (savedFootprint) {
        set({ footprint: JSON.parse(savedFootprint) });
      } else if (get().progress && get().progress.length > 0) {
        set({ footprint: get().progress[0].results });
      }
    } else {
      set({ user: null, footprint: null });
    }
    set({ isLoading: false });
  },

  // Auth: Signup
  signup: async (email, password, displayName) => {
    set({ isLoading: true, error: null });

    if (!get().offlineMode) {
      try {
        const res = await api.post("/auth/register", {
          email,
          password,
          displayName,
        });
        set({ user: res.data.user });
        localStorage.setItem("eco_user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("API signup failed.", err);
        set({
          error: err.response?.data?.error || "Registration failed.",
          isLoading: false,
        });
        return false;
      }
    } else {
      set({
        error: "Cannot register in offline mode. Please connect to the server.",
        isLoading: false,
      });
      return false;
    }

    set({ isLoading: false });
    return true;
  },

  // Auth: Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Auto-demo bypass check
    if (
      email === "operator.alpha@eco-impact.net" &&
      password === "security_code_7"
    ) {
      const defaultUser = {
        uid: "demo_operator_alpha",
        displayName: "Alex Rivera",
        email: email,
        location: { city: "Durgapur", state: "West Bengal", country: "IN" },
        householdSize: 3,
        homeType: "apartment",
        primaryCommute: "transit",
        dietType: "vegetarian",
        primaryGoal: "Reduce emissions 20% this year",
        greenScore: 820,
        level: "guardian",
        streakDays: 5,
        lastStreakDate: new Date().toISOString(),
        badges: ["first_step", "eco_enthusiast", "streak_master"],
        weeklyChallenge: {
          id: "challenge_w1",
          title: "Swap 2 beef portions for pulses.",
          completed: false,
          targetDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      };
      set({ user: defaultUser });
      localStorage.setItem("eco_user", JSON.stringify(defaultUser));
      await get().fetchHistory();
      await get().fetchSuggestions();
      await get().fetchLeaderboard();
      await get().fetchCompletedActions();
      set({ isLoading: false });
      return true;
    }

    if (!get().offlineMode) {
      try {
        const res = await api.post("/auth/login", { email, password });
        set({ user: res.data.user });
        localStorage.setItem("eco_user", JSON.stringify(res.data.user));

        await get().fetchHistory();
        await get().fetchSuggestions();
        await get().fetchLeaderboard();
        await get().fetchCompletedActions();
      } catch (err) {
        console.error("API login failed.", err);
        set({
          error: err.response?.data?.error || "Login failed.",
          isLoading: false,
        });
        return false;
      }
    } else {
      set({
        error:
          "Cannot log in during offline mode. Please connect to the server.",
        isLoading: false,
      });
      return false;
    }

    set({ isLoading: false });
    return true;
  },

  // Auth: Logout
  logout: () => {
    set({
      user: null,
      footprint: null,
      suggestions: [],
      progress: [],
      actions: [],
    });
    localStorage.removeItem("eco_user");
    localStorage.removeItem("eco_footprint");
  },

  // Profile update / Onboarding step
  updateProfile: async (profileUpdates) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    const updatedUser = { ...user, ...profileUpdates };

    if (!get().offlineMode) {
      try {
        const res = await api.post("/users/profile", {
          uid: user.uid,
          profile: updatedUser,
        });
        set({ user: res.data.user });
        localStorage.setItem("eco_user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("API profile update failed, falling back to local.", err);
        set({ user: updatedUser });
        localStorage.setItem("eco_user", JSON.stringify(updatedUser));
      }
    } else {
      set({ user: updatedUser });
      localStorage.setItem("eco_user", JSON.stringify(updatedUser));
    }
    set({ isLoading: false });
  },

  // Calculation: calculates client-side, optionally sends to save
  calculateEmissions: async (inputs) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    let results = calculateFootprint(inputs);

    // Call API for calculation if online
    if (!get().offlineMode) {
      try {
        const res = await api.post("/footprint/calculate", { inputs });
        results = res.data.results;
      } catch (err) {
        console.error("API calculation failed, using local engine.", err);
      }
    }

    set({ footprint: results });
    localStorage.setItem("eco_footprint", JSON.stringify(results));
    set({ isLoading: false });
    return results;
  },

  // Save footprint to logs
  saveFootprintResult: async (inputs, results) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    const timestamp = new Date().toISOString();

    // Update user stats locally first
    const updatedUser = {
      ...user,
      greenScore: results.greenScore,
      level: results.level,
      lastActiveAt: timestamp,
    };
    set({ user: updatedUser, footprint: results });
    localStorage.setItem("eco_user", JSON.stringify(updatedUser));
    localStorage.setItem("eco_footprint", JSON.stringify(results));

    if (!get().offlineMode) {
      try {
        await api.post("/footprint/save", { uid: user.uid, inputs, results });
      } catch (err) {
        console.error("API save footprint failed, caching locally.", err);
        // Local log save
        saveLocalFootprintLog(user.uid, timestamp, inputs, results);
      }
    } else {
      saveLocalFootprintLog(user.uid, timestamp, inputs, results);
    }

    // Refresh history, suggestions, and leaderboard
    await get().fetchHistory();
    await get().fetchSuggestions();
    await get().fetchLeaderboard();
    set({ isLoading: false });
  },

  // Fetch footprint history
  fetchHistory: async () => {
    const { user } = get();
    if (!user) return;

    if (!get().offlineMode) {
      try {
        const res = await api.get(`/footprint/${user.uid}/history`);
        set({ progress: res.data });
      } catch (err) {
        console.error("API history load failed, falling back to local.", err);
        loadLocalHistory(user.uid);
      }
    } else {
      loadLocalHistory(user.uid);
    }
  },

  // Fetch AI suggestions
  fetchSuggestions: async () => {
    const { user, footprint } = get();
    if (!user) return;

    // Load from localStorage first if available
    const localSaved = localStorage.getItem(`eco_suggestions_${user.uid}`);
    if (localSaved) {
      set({ suggestions: JSON.parse(localSaved) });
    }

    const fp = footprint || JSON.parse(localStorage.getItem("eco_footprint"));
    if (!fp) return;

    if (!get().offlineMode) {
      try {
        const res = await api.post("/ai/suggestions", {
          uid: user.uid,
          footprintData: fp,
          userProfile: user,
        });
        set({ suggestions: res.data.suggestions });
        localStorage.setItem(
          `eco_suggestions_${user.uid}`,
          JSON.stringify(res.data.suggestions),
        );
      } catch (err) {
        console.error(
          "API suggestions fetch failed, falling back to local rules-based recommendations.",
          err,
        );
        loadLocalSuggestions(fp);
      }
    } else {
      loadLocalSuggestions(fp);
    }
  },

  // Add a custom suggestion manually as pending recommendation
  addCustomSuggestion: async (suggestionData) => {
    const { user } = get();
    if (!user) return;

    const newSuggestion = {
      id: "manual_" + Math.random().toString(36).substr(2, 9),
      title: suggestionData.title,
      description:
        suggestionData.description || "manually logged custom protocol.",
      category: suggestionData.category,
      savingKgPerYear: parseInt(suggestionData.savingKgPerYear) || 0,
      difficulty: suggestionData.difficulty || "Easy",
      timeToImplement: suggestionData.timeToImplement || "Immediate",
      status: "pending",
      source: "manual",
      notes: suggestionData.notes || null,
    };

    const updatedSuggestions = [newSuggestion, ...get().suggestions];
    set({ suggestions: updatedSuggestions });
    localStorage.setItem(
      `eco_suggestions_${user.uid}`,
      JSON.stringify(updatedSuggestions),
    );

    if (!get().offlineMode) {
      try {
        await api.post("/suggestions/custom", {
          uid: user.uid,
          suggestion: newSuggestion,
        });
      } catch (err) {
        console.error("Failed to log custom suggestion to API", err);
      }
    }
  },

  // Execute / complete a suggestion protocol
  completeAction: async (actionId, actionData) => {
    const { user } = get();
    if (!user) return;

    const timestamp = new Date().toISOString();

    // locally update suggestions checklist
    const updatedSuggestions = get().suggestions.map((s) =>
      s.id === actionId ? { ...s, status: "accepted" } : s,
    );
    set({ suggestions: updatedSuggestions });
    localStorage.setItem(
      `eco_suggestions_${user.uid}`,
      JSON.stringify(updatedSuggestions),
    );

    // locally update user parameters
    const updatedScore = Math.min(1000, user.greenScore + 50);
    const completedCount = get().actions.length + 1;

    // Streaks
    let streak = user.streakDays;
    const lastActive = user.lastStreakDate;
    if (lastActive) {
      const diffHrs = (new Date() - new Date(lastActive)) / (1000 * 60 * 60);
      if (diffHrs <= 24) {
        streak = streak + 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    const badges = [...user.badges];
    if (!badges.includes("first_step")) badges.push("first_step");
    if (updatedScore > 600 && !badges.includes("eco_enthusiast"))
      badges.push("eco_enthusiast");
    if (updatedScore > 800 && !badges.includes("carbon_neutralizer"))
      badges.push("carbon_neutralizer");
    if (streak >= 3 && !badges.includes("streak_master"))
      badges.push("streak_master");
    if (completedCount >= 3 && !badges.includes("action_taker"))
      badges.push("action_taker");

    let level = "seedling";
    if (updatedScore >= 750) level = "guardian";
    else if (updatedScore >= 500) level = "tree";
    else if (updatedScore >= 250) level = "sapling";

    const updatedUser = {
      ...user,
      greenScore: updatedScore,
      streakDays: streak,
      lastStreakDate: timestamp,
      badges,
      level,
    };

    set({ user: updatedUser });
    localStorage.setItem("eco_user", JSON.stringify(updatedUser));

    if (!get().offlineMode) {
      try {
        await api.post("/actions/log", { uid: user.uid, actionId, actionData });
      } catch (err) {
        console.error("API log action failed, caching locally.", err);
        saveLocalAction(user.uid, actionId, actionData, timestamp);
      }
    } else {
      saveLocalAction(user.uid, actionId, actionData, timestamp);
    }

    await get().fetchCompletedActions();
  },

  // Dismiss a suggestion card
  dismissSuggestion: (actionId) => {
    const { user } = get();
    const updatedSuggestions = get().suggestions.map((s) =>
      s.id === actionId ? { ...s, status: "dismissed" } : s,
    );
    set({ suggestions: updatedSuggestions });
    if (user) {
      localStorage.setItem(
        `eco_suggestions_${user.uid}`,
        JSON.stringify(updatedSuggestions),
      );
    }
  },

  // Fetch user completed actions list
  fetchCompletedActions: async () => {
    const { user } = get();
    if (!user) return;

    if (!get().offlineMode) {
      try {
        const res = await api.get(`/actions/${user.uid}/completed`);
        set({ actions: res.data });
      } catch (err) {
        console.error("API actions fetch failed", err);
        loadLocalCompletedActions(user.uid);
      }
    } else {
      loadLocalCompletedActions(user.uid);
    }
  },

  // Fetch community leaderboard
  fetchLeaderboard: async () => {
    if (!get().offlineMode) {
      try {
        const res = await api.get("/leaderboard");
        set({ leaderboard: res.data });
      } catch (err) {
        console.error("API leaderboard fetch failed", err);
        loadLocalLeaderboard();
      }
    } else {
      loadLocalLeaderboard();
    }
  },

  // Send a chat message
  sendChatMessage: async (messageText, history) => {
    const { user, footprint, actions } = get();
    if (!user) return "OPERATOR_ERROR: USER_NODE_DISCONNECTED";

    const fp = footprint ||
      JSON.parse(localStorage.getItem("eco_footprint")) || {
        total: 4200,
        breakdown: {},
      };
    const categories = Object.entries(fp.breakdown || {}).sort(
      (a, b) => b[1] - a[1],
    );
    const topCat = categories[0]?.[0] || "transport";
    const topValue = categories[0]?.[1] || 0;

    const userContext = {
      name: user.displayName,
      location: `${user.location.city}, ${user.location.state}`,
      totalKgCO2e: fp.total,
      topCategory: topCat,
      topValue,
      completedActions: actions.length,
      greenScore: fp.greenScore !== undefined ? fp.greenScore : user.greenScore,
      level: fp.level || user.level,
    };

    // Chat.jsx already appends the latest user message to the history parameter
    const updatedMessages = [...history];

    if (!get().offlineMode) {
      try {
        const res = await api.post("/ai/chat", {
          uid: user.uid,
          messages: updatedMessages,
          userContext,
        });
        return res.data.reply;
      } catch (err) {
        console.error("API chat failed, falling back to local chatbot.", err);
        return mockChatReply(messageText, userContext);
      }
    } else {
      return mockChatReply(messageText, userContext);
    }
  },

  // Complete weekly challenge
  completeWeeklyChallenge: async () => {
    const { user } = get();
    if (!user || !user.weeklyChallenge || user.weeklyChallenge.completed)
      return;

    set({ isLoading: true });
    const timestamp = new Date().toISOString();

    const updatedChallenge = {
      ...user.weeklyChallenge,
      completed: true,
    };

    // Increment score by 100 points
    const updatedScore = Math.min(1000, user.greenScore + 100);
    const badges = [...user.badges];

    // Unlock elite badges if eligible
    if (updatedScore > 600 && !badges.includes("eco_enthusiast"))
      badges.push("eco_enthusiast");
    if (updatedScore > 800 && !badges.includes("carbon_neutralizer"))
      badges.push("carbon_neutralizer");

    let level = "seedling";
    if (updatedScore >= 750) level = "guardian";
    else if (updatedScore >= 500) level = "tree";
    else if (updatedScore >= 250) level = "sapling";

    const updatedUser = {
      ...user,
      greenScore: updatedScore,
      level,
      badges,
      lastActiveAt: timestamp,
      weeklyChallenge: updatedChallenge,
    };

    set({ user: updatedUser });
    localStorage.setItem("eco_user", JSON.stringify(updatedUser));

    if (!get().offlineMode) {
      try {
        await api.post("/users/profile", {
          uid: user.uid,
          profile: updatedUser,
        });
      } catch (err) {
        console.error(
          "API complete weekly challenge failed, cached locally.",
          err,
        );
      }
    }

    // Sync leaderboard
    await get().fetchLeaderboard();
    set({ isLoading: false });
  },
}));

// Local fallback implementations

function saveLocalFootprintLog(uid, timestamp, inputs, results) {
  const key = `history_${uid}`;
  const logs = JSON.parse(localStorage.getItem(key) || "[]");
  logs.unshift({
    calculatedAt: timestamp,
    inputs,
    results,
  });
  localStorage.setItem(key, JSON.stringify(logs));
}

function loadLocalHistory(uid) {
  const key = `history_${uid}`;
  const logs = JSON.parse(localStorage.getItem(key) || "[]");
  useStore.setState({ progress: logs });
}

function loadLocalSuggestions(fp) {
  const savedUser = localStorage.getItem("eco_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    const localSaved = localStorage.getItem(`eco_suggestions_${user.uid}`);
    if (localSaved) {
      useStore.setState({ suggestions: JSON.parse(localSaved) });
      return;
    }
  }

  // Simple generator matching backend fallback Suggestions
  const breakdown = fp.breakdown || {
    transport: 1000,
    food: 1000,
    home: 1000,
    lifestyle: 500,
  };
  const primaryCategory =
    Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "transport";

  const defaultSuggestions = [
    {
      id: "mock_1",
      title: "Shift Commutes to Metro",
      description:
        "Use metro instead of petrol vehicle for your daily schedule.",
      category: "transport",
      savingKgPerYear: 480,
      difficulty: "Easy",
      timeToImplement: "This Week",
      status: "pending",
    },
    {
      id: "mock_2",
      title: "1 Meatless Day Per Week",
      description:
        "Cut out high-methane meats for plant-based meals on Mondays.",
      category: "food",
      savingKgPerYear: 180,
      difficulty: "Easy",
      timeToImplement: "Immediate",
      status: "pending",
    },
    {
      id: "mock_3",
      title: "Switch off Standby Devices",
      description:
        "Unplug chargers and appliances when idle to stop standby load draws.",
      category: "home",
      savingKgPerYear: 150,
      difficulty: "Easy",
      timeToImplement: "Immediate",
      status: "pending",
    },
    {
      id: "mock_4",
      title: "Limit Wardrobe Size",
      description: "Skip fast fashion buys and wear high-quality items longer.",
      category: "lifestyle",
      savingKgPerYear: 340,
      difficulty: "Medium",
      timeToImplement: "This Month",
      status: "pending",
    },
    {
      id: "mock_5",
      title: "Adopt Electric 2-Wheeler",
      description:
        "Swap out daily gasoline scooter trips for electric alternatives.",
      category: "transport",
      savingKgPerYear: 750,
      difficulty: "Medium",
      timeToImplement: "This Month",
      status: "pending",
    },
    {
      id: "mock_6",
      title: "Source 80% Local Groceries",
      description:
        "Buy from local farmers and mandis to bypass heavy transport emissions.",
      category: "food",
      savingKgPerYear: 280,
      difficulty: "Medium",
      timeToImplement: "This Week",
      status: "pending",
    },
    {
      id: "mock_7",
      title: "Install 5-Star BEE AC",
      description:
        "Upgrade old home air conditioning to new high-efficiency systems.",
      category: "home",
      savingKgPerYear: 820,
      difficulty: "Hard",
      timeToImplement: "This Month",
      status: "pending",
    },
    {
      id: "mock_8",
      title: "Transition to Plant-Based Diet",
      description:
        "Commit fully to plant-based diet to avoid animal farming impact.",
      category: "food",
      savingKgPerYear: 650,
      difficulty: "Hard",
      timeToImplement: "This Month",
      status: "pending",
    },
  ];

  useStore.setState({ suggestions: defaultSuggestions });
  if (savedUser) {
    const user = JSON.parse(savedUser);
    localStorage.setItem(
      `eco_suggestions_${user.uid}`,
      JSON.stringify(defaultSuggestions),
    );
  }
}

function saveLocalAction(uid, actionId, actionData, timestamp) {
  const key = `actions_${uid}`;
  const actions = JSON.parse(localStorage.getItem(key) || "[]");
  actions.push({
    actionId,
    title: actionData.title,
    category: actionData.category,
    savingKgPerYear: actionData.savingKgPerYear,
    difficulty: actionData.difficulty,
    completedAt: timestamp,
    source: actionData.source || "ai_suggestion",
    notes: actionData.notes || null,
  });
  localStorage.setItem(key, JSON.stringify(actions));
}

function loadLocalCompletedActions(uid) {
  const key = `actions_${uid}`;
  const actions = JSON.parse(localStorage.getItem(key) || "[]");
  useStore.setState({ actions });
}

function loadLocalLeaderboard() {
  const defaultLeaderboard = [
    {
      uid: "leaderboard_priya",
      displayName: "Priya Nair",
      greenScore: 910,
      footprintTotal: 1200,
      level: "guardian",
      lastUpdated: "2026-06-11T12:00:00Z",
    },
    {
      uid: "leaderboard_elena",
      displayName: "Elena Rostova",
      greenScore: 880,
      footprintTotal: 1800,
      level: "guardian",
      lastUpdated: "2026-06-11T12:00:00Z",
    },
    {
      uid: "leaderboard_alex",
      displayName: "Alex Rivera",
      greenScore: 820,
      footprintTotal: 2400,
      level: "guardian",
      lastUpdated: "2026-06-11T12:00:00Z",
    },
    {
      uid: "leaderboard_vikram",
      displayName: "Vikram Mehta",
      greenScore: 560,
      footprintTotal: 3800,
      level: "tree",
      lastUpdated: "2026-06-11T12:00:00Z",
    },
    {
      uid: "leaderboard_samir",
      displayName: "Samir Sen",
      greenScore: 420,
      footprintTotal: 5100,
      level: "sapling",
      lastUpdated: "2026-06-11T12:00:00Z",
    },
  ];

  // Mix in current user if exists
  const savedUser = localStorage.getItem("eco_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    const savedFootprint = localStorage.getItem("eco_footprint");
    const footprint = savedFootprint
      ? JSON.parse(savedFootprint)
      : { total: 4200 };

    const idx = defaultLeaderboard.findIndex((l) => l.uid === user.uid);
    const userRecord = {
      uid: user.uid,
      displayName: user.displayName,
      greenScore: user.greenScore,
      footprintTotal: footprint.total,
      level: user.level,
      lastUpdated: new Date().toISOString(),
    };

    if (idx !== -1) {
      defaultLeaderboard[idx] = userRecord;
    } else {
      defaultLeaderboard.push(userRecord);
    }
  }

  defaultLeaderboard.sort((a, b) => b.greenScore - a.greenScore);
  useStore.setState({ leaderboard: defaultLeaderboard });
}

function mockChatReply(userText, context) {
  const query = userText.toLowerCase();
  const name = context.name || "Eco Warrior";
  const total = context.totalKgCO2e || 4000;
  const topCat = context.topCategory || "Transport";

  // Regular expressions using word boundaries to avoid false positives (e.g. 'car' in 'carbon', 'hi' in 'shift')
  const helloRegex = /\b(hello|hi|hey)\b/;
  const transportRegex =
    /\b(metro|transit|car|cars|transport|travel|commute|commuting)\b/;
  const foodRegex =
    /\b(food|diet|dietary|meat|vegan|veg|vegetarian|vegetable|vegetables|veggie|veggies)\b/;
  const energyRegex =
    /\b(energy|electricity|ac|solar|lpg|power|grid|electricityindia)\b/;
  const lifestyleRegex =
    /\b(clothing|buy|buying|lifestyle|shopping|clothes|fashion)\b/;
  const scoreRegex = /\b(score|green|rank|level|tier)\b/;

  if (helloRegex.test(query)) {
    return `Hello ${name}! I am CarbonCoach. Currently synchronizing telemetry from your node. Your active carbon footprint reads ${total} kg CO2e/year. How can I assist you in routing reduction protocols today?`;
  }
  if (transportRegex.test(query)) {
    return `Commuting is a major vector! Replacing standard gasoline trips with the local Metro reduces transport emissions by over 80% per kilometer (0.031 kg/km for Metro vs 0.21 kg/km for Petrol Cars). Carpooling or shifting to WFH are also excellent routes.`;
  }
  if (foodRegex.test(query)) {
    return `In India, diets play a critical role. Shifting to a vegetarian diet saves roughly 1.7 tons of CO2e per year compared to high-meat diets. Minimizing daily organic waste prevents landfill methane leakage, which is a powerful greenhouse gas!`;
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
