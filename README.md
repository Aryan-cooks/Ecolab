<div align="center">

```
███████╗ ██████╗ ██████╗       ██╗      █████╗ ██████╗
██╔════╝██╔════╝██╔═══██╗      ██║     ██╔══██╗██╔══██╗
█████╗  ██║     ██║   ██║      ██║     ███████║██████╔╝
██╔══╝  ██║     ██║   ██║      ██║     ██╔══██║██╔══██╗
███████╗╚██████╗╚██████╔╝      ███████╗██║  ██║██████╔╝
╚══════╝ ╚═════╝ ╚═════╝       ╚══════╝╚═╝  ╚═╝╚═════╝
                                                  V2.4
```

**A cyberpunk-styled carbon footprint awareness & tracking platform.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📡 Overview

**ECO-LAB V2.4** is a full-stack carbon footprint tracking web application built with a cyberpunk terminal aesthetic. It empowers users (referred to as *nodes*) to calculate, track, and reduce their personal carbon emissions across transport, food, home energy, and lifestyle sectors.

The interface is deliberately raw and tactical — treating climate action not as passive awareness, but as a **critical mission requiring systemic intervention.**

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🛸 **Landing Page** | Animated cyberpunk entry point with glitch effects and target cursor |
| 🔐 **Authentication** | Firebase-based login & registration with persistent session |
| 🗺️ **Onboarding** | Location setup for contextualised emissions data |
| 📊 **Dashboard** | Live telemetry of footprint breakdown, history, AI tips, and peer comparison |
| 🧮 **Calculator** | Data Analysis Lab — input 14 parameters across 4 sectors for live CO₂e calculation |
| 🌿 **Suggestions** | AI-generated (Gemini API) personalised reduction protocols per user vector |
| 📈 **Tracker** | Vector analytics with historical charts, streaks, and milestone tracking |
| 💬 **Node Sync Chat** | Real-time AI-powered carbon reduction assistant |
| 🏆 **Achievements** | Gamified mission milestones and badge system |
| 📖 **Manifesto Modal** | Sequential terminal-typed mission statement in the sidebar |

---

## 🖥️ Tech Stack

### Frontend (Client)
- **[React 18](https://react.dev)** — Component-based UI framework
- **[Vite 8](https://vitejs.dev)** — Blazing-fast dev server & bundler
- **[Tailwind CSS 3](https://tailwindcss.com)** — Utility-first styling with custom cyberpunk design tokens
- **[React Router DOM 6](https://reactrouter.com)** — Client-side hash routing
- **[Zustand](https://zustand-demo.pmnd.rs)** — Lightweight global state management
- **[Recharts](https://recharts.org)** — Data visualization for emission charts
- **[GSAP](https://gsap.com)** — High-performance animations (cursor, typing effects)
- **[Motion](https://motion.dev)** — Declarative animations for UI transitions
- **[Firebase](https://firebase.google.com)** — Authentication

### Backend (Server)
- **[Node.js](https://nodejs.org) + [Express 4](https://expressjs.com)** — REST API server
- **[Gemini API](https://ai.google.dev)** — AI-generated sustainability suggestions & chat
- **[JSON file store](./server/db.json)** — Lightweight persistent data storage
- **[Nodemon](https://nodemon.io)** — Dev server auto-reload
- **[UUID](https://github.com/uuidjs/uuid)** — Unique ID generation for records

---

## 🎨 Custom UI Components

ECO-LAB features a set of premium interactive components translated from React Bits & Vue Bits:

| Component | Description |
|-----------|-------------|
| **`TargetCursor`** | Custom GSAP-animated target-lock cursor that snaps to interactive elements |
| **`DecryptedText`** | Scramble-decrypt text animation on hover/view |
| **`TextType`** | Sequential terminal typewriter effect with GSAP cursor blinking |
| **`ElasticSlider`** | Physics-based elastic slider with spring bounce and overflow stretching |
| **`BorderGlow`** | Edge-sensitive glowing borders that react to cursor proximity |
| **`LetterGlitch`** | Canvas-based background glitch animation |

---

## 📁 Project Structure

```
carbon-awareness-platform/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.jsx     # Navigation + Manifesto Modal
│   │   ├── Header.jsx      # Top bar with user info
│   │   ├── TargetCursor.jsx
│   │   ├── DecryptedText.jsx
│   │   ├── TextType.jsx
│   │   ├── ElasticSlider.jsx
│   │   ├── BorderGlow.jsx
│   │   └── LetterGlitch.jsx
│   ├── pages/              # Route-level page components
│   │   ├── LandingPage.jsx
│   │   ├── Auth.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Calculator.jsx
│   │   ├── Suggestions.jsx
│   │   ├── Tracker.jsx
│   │   ├── Chat.jsx
│   │   └── Achievements.jsx
│   ├── store/
│   │   └── useStore.js     # Zustand global state
│   ├── utils/
│   │   └── calculationEngine.js  # CO₂e calculation logic
│   ├── firebase/
│   │   └── config.js       # Firebase app initialization
│   └── App.jsx             # Root layout, routing, protected routes
├── server/
│   ├── index.js            # Express API (footprint, suggestions, chat, system)
│   ├── db.json             # JSON data store
│   └── package.json
├── designs/                # Static HTML design mockups
├── tailwind.config.js      # Custom cyberpunk theme tokens
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- A **Firebase** project with Email/Password auth enabled
- A **Google Gemini API** key (optional — falls back to rule-based suggestions)

### 1. Clone the Repository

```bash
git clone https://github.com/Aryan-cooks/Ecolab.git
cd Ecolab
```

### 2. Install Client Dependencies

```bash
npm install
```

### 3. Install Server Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

Create `src/firebase/config.js` with your Firebase credentials:

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run the Development Server

```bash
# Runs both client (Vite) and server (Express) concurrently
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |

---

## 🔌 API Endpoints

The Express server exposes the following REST API routes:

### Footprint
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/footprint/save` | Save a new footprint snapshot |
| `GET` | `/api/footprint/:uid` | Get all footprint history for a user |
| `GET` | `/api/footprint/:uid/latest` | Get the most recent footprint |

### Suggestions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/suggestions/generate` | Generate AI reduction suggestions |
| `GET` | `/api/suggestions/:uid` | Retrieve cached suggestions |
| `PATCH` | `/api/suggestions/:uid/:id` | Update suggestion status |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message to the AI carbon assistant |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/system/stats` | Get live CPU load & server uptime |
| `GET` | `/api/system/tips` | Get a random AI-generated green tip |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create or update a user profile |
| `GET` | `/api/users/:uid` | Get user profile |

---

## 🧮 Carbon Calculation Engine

The `calculationEngine.js` utility computes annual CO₂ equivalent emissions across 4 sectors:

| Sector | Inputs |
|--------|--------|
| 🚗 **Transport** | Vehicle type, weekly km, transit share %, annual flights |
| 🥦 **Food** | Diet type, food waste level, local sourcing % |
| ⚡ **Home** | Monthly kWh, LPG cylinders/month, home size (m²) |
| 👟 **Lifestyle** | Monthly clothing spend, screen hours/day, recycling habits |

Output includes: `totalKg`, `totalTons`, sector `breakdown`, `greenScore`, `level`, and `percentileRank`.

---

## 🎭 Design System

The cyberpunk theme is defined in `tailwind.config.js` with these core tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `neon-green` | `#00FF41` | Primary accent, borders, text |
| `neon-amber` | `#FFAA00` | Secondary labels and headers |
| `neon-red` | `#FF3131` | Alerts, logout, warnings |
| `surface` | `#0d0d0f` | Card & modal backgrounds |
| `outline` | `#1f2a1f` | Borders and dividers |
| `background` | `#000000` | Page background |

Custom animations: `scanline`, `terminal-glow`, `glitch`, `matrix-rain`.

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client + server in watch mode |
| `npm run client` | Start only the Vite frontend |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run ESLint across all source files |
| `npm run preview` | Preview the production build locally |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ⚡ and a deep concern for planetary thermal overload.**

*ECO-LAB V2.4 — NODE AWARENESS CONFIRMED.*

</div>
