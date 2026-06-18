import { useState, useEffect, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import axios from "axios";
import DecryptedText from "./DecryptedText";

export default function Sidebar() {
  const { logout, user } = useStore();
  const navigate = useNavigate();
  const [sysStats, setSysStats] = useState({ cpu: 42, uptime: 448321 }); // fallback init
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/system/stats");
        setSysStats(res.data);
      } catch {
        // silently fallback or ignore on error
      }
    };
    fetchStats();
    const intervalId = setInterval(fetchStats, 2000); // Poll every 2 seconds
    return () => clearInterval(intervalId);
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const links = [
    { name: "MAIN_DASHBOARD", path: "/dashboard", icon: "dashboard" },
    { name: "CALC_ENGINE", path: "/calculator", icon: "calculate" },
    {
      name: "NEUTRAL_PROTOCOLS",
      path: "/suggestions",
      icon: "energy_savings_leaf",
    },
    { name: "VECTOR_ANALYTICS", path: "/tracker", icon: "trending_up" },
    { name: "NODE_SYNC_CHAT", path: "/chat", icon: "forum" },
    {
      name: "MISSION_MILESTONES",
      path: "/achievements",
      icon: "military_tech",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col py-6 px-4 bg-black border-r-2 border-neon-green z-50">
        <div className="mb-8 px-2 cursor-pointer group" onClick={() => setIsManifestoOpen(true)}>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-neon-green group-hover:animate-pulse">
              terminal
            </span>
            <h1 className="font-bold text-xl text-neon-green terminal-glow group-hover:brightness-125 transition-all">
              <DecryptedText text="ECO-LAB V2.4" animateOn="hover" />
            </h1>
          </div>
          <p className="text-[10px] text-neon-green opacity-60 group-hover:opacity-100 transition-opacity">
            SYSTEM STATUS: OPERATIONAL{" "}
            <span className="opacity-0 group-hover:opacity-100 ml-1 text-neon-amber">
              {" "}
              [VIEW MANIFESTO]
            </span>
          </p>
        </div>

        {/* Manifesto Modal */}
        {isManifestoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border-2 border-neon-green w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-neon-green text-black px-4 py-2 flex justify-between items-center font-bold text-xs uppercase tracking-widest">
                <span>[ TERMINAL_MANIFESTO_PROTOCOL ]</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManifestoOpen(false);
                  }}
                  className="hover:bg-black hover:text-neon-green px-2 py-0.5 transition-colors"
                >
                  [X] ABORT
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto telemetry-scroll text-neon-green">
                <div className="space-y-2 border-b border-neon-green/30 pb-4">
                  <h2 className="text-xl md:text-2xl font-black terminal-glow uppercase">
                    The Eco-Lab Directive
                  </h2>
                  <p className="text-[10px] md:text-xs text-neon-amber animate-pulse">
                    DECRYPTING MISSION STATEMENT...
                  </p>
                </div>

                <div className="space-y-4 text-xs md:text-sm leading-relaxed">
                  <div>
                    <h3 className="text-neon-amber font-bold mb-1">&gt; 01_MOTIVE</h3>
                    <p className="opacity-80">
                      Our planetary system is facing critical thermal overload. The ECO-LAB V2.4
                      terminal is deployed to give nodes (users) direct, actionable telemetry on
                      their personal carbon emission vectors.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-neon-amber font-bold mb-1">&gt; 02_WHY_IT_WORKS</h3>
                    <p className="opacity-80">
                      Sustainability is often paralyzed by ambiguity. This interface works by
                      breaking down monolithic carbon impact into precise, manageable sub-sectors
                      (Transport, Nutrition, Residential, Externals). Visibility leads to
                      accountability. Accountability leads to optimization.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-neon-amber font-bold mb-1">&gt; 03_SYSTEM_USES</h3>
                    <ul className="list-disc list-inside opacity-80 space-y-1 ml-2">
                      <li>
                        <span className="text-white">TELEMETRY:</span> Calculate and track exact
                        baseline emissions.
                      </li>
                      <li>
                        <span className="text-white">PROTOCOLS:</span> Execute AI-generated
                        reduction strategies tailored to your vectors.
                      </li>
                      <li>
                        <span className="text-white">SYNCHRONIZATION:</span> Compare operational
                        efficiency against peer nodes and global averages.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-neon-amber font-bold mb-1">&gt; 04_DESIGN_ARCHITECTURE</h3>
                    <p className="opacity-80">
                      Designed as a tactical response terminal, ECO-LAB shifts the paradigm from
                      passive ecological anxiety to active, gamified operational security. The
                      interface is deliberately raw—treating climate action not as an abstract
                      concept, but as a critical mission requiring systemic intervention.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neon-green/30 text-[10px] text-neon-green/60">
                  END OF TRANSMISSION. NODE AWARENESS CONFIRMED.
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 border-l-4 transition-colors font-bold text-sm ${
                  isActive
                    ? "bg-neon-green text-black border-neon-amber"
                    : "text-neon-green border-transparent hover:bg-matrix-dim"
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              <span>
                <DecryptedText text={link.name} animateOn="hover" />
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-4 border-t border-neon-green/30">
          <div className="text-[10px] space-y-1 text-neon-green/80">
            <p className="flex justify-between">
              <span>UPTIME:</span> <span>{formatUptime(sysStats.uptime)}</span>
            </p>
            <p className="flex justify-between">
              <span>CPU LOAD:</span> <span className="text-neon-amber">{sysStats.cpu}%</span>
            </p>
            <p className="flex justify-between">
              <span>NODE ID:</span> <span>{user.uid.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full border-2 border-neon-red text-neon-red py-2 px-4 font-bold flex items-center justify-center gap-2 hover:bg-neon-red hover:text-black transition-all text-xs"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <DecryptedText text="DISCONNECT_NODE" animateOn="hover" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-neon-green z-50 flex justify-around items-center py-1 px-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 min-w-0 px-0.5 ${
                isActive ? "text-neon-amber terminal-glow" : "text-neon-green"
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{link.icon}</span>
            <span className="text-[7px] mt-0.5 tracking-tight font-black text-center leading-[1.1]">
              {link.name.split("_").map((word, idx) => (
                <Fragment key={idx}>
                  {word}
                  {idx === 0 && <br />}
                </Fragment>
              ))}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
