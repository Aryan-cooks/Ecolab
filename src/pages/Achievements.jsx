/* eslint-disable react-hooks/purity */
import { useEffect, useState, useMemo } from "react";
import { useStore } from "../store/useStore";

export default function Achievements() {
  const { user, actions, fetchLeaderboard } = useStore();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const completed = actions || [];
  const sortedActions = [...completed].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
  );

  // Calculate some stats based on user data
  const greenScore = user?.greenScore || 500;
  const level = user?.level || "eco-warrior";
  const streak = user?.streakDays || 5;
  const rank = Math.round(greenScore / 10); // Pseudo rank percentile

  const currentTimeString = useMemo(() => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const timeOneHourAgoString = useMemo(() => {
    return new Date(Date.now() - 3600000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-black relative overflow-y-auto min-h-screen">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 pb-32">
        {/* 1. OPERATOR_STATUS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-neon-green/30 bg-surface p-4 flex flex-col items-center justify-center space-y-2 hover:border-neon-green transition-colors relative group">
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
            <span className="font-mono text-[9px] text-neon-green/60 tracking-[0.2em] uppercase">
              SYNERGY_LEVEL
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-neon-green terminal-glow">
              {rank}%
            </span>
            <div className="w-full h-1 bg-black border border-neon-green/30">
              <div
                className="h-full bg-neon-green shadow-[0_0_10px_#00FF41]"
                style={{ width: `${rank}%` }}
              ></div>
            </div>
          </div>
          <div className="border border-neon-green/30 bg-surface p-4 flex flex-col items-center justify-center space-y-2 hover:border-neon-green transition-colors relative">
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
            <span className="font-mono text-[9px] text-neon-green/60 tracking-[0.2em] uppercase">
              CLEARANCE
            </span>
            <span className="font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-neon-amber truncate w-full text-center">
              {level.toUpperCase().slice(0, 12)}
            </span>
            <span className="font-mono text-[9px] text-neon-green/60 uppercase tracking-widest">
              STRATEGIC_CMD
            </span>
          </div>
          <div className="border border-neon-green/30 bg-surface p-4 flex flex-col items-center justify-center space-y-2 hover:border-neon-green transition-colors relative">
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
            <span className="font-mono text-[9px] text-neon-green/60 tracking-[0.2em] uppercase">
              UPTIME
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-neon-green terminal-glow">
              {streak}D
            </span>
            <span className="font-mono text-[9px] text-neon-green/60 uppercase tracking-widest">
              CONT_SESS
            </span>
          </div>
          <div className="border border-neon-green/30 bg-surface p-4 flex flex-col items-center justify-center space-y-2 hover:border-neon-green transition-colors relative">
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
            <span className="font-mono text-[9px] text-neon-green/60 tracking-[0.2em] uppercase">
              NODE_RANK
            </span>
            <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-neon-green terminal-glow">
              TOP_{Math.max(1, 100 - rank)}%
            </span>
            <span className="font-mono text-[9px] text-neon-green/60 uppercase tracking-widest">
              GLOBAL_OPERATOR
            </span>
          </div>
        </section>

        {/* 2. CORE_SECURITY_BADGES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neon-green/30 pb-2 gap-2">
            <h2 className="font-mono text-lg sm:text-xl md:text-2xl font-extrabold text-neon-green terminal-glow tracking-tighter uppercase">
              CORE_SECURITY_BADGES
            </h2>
            <span className="font-mono text-[10px] text-neon-green/60 uppercase tracking-widest">
              DECRYPTED: {user?.badges?.length || 0} / 5 PROTOCOLS UNLOCKED
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              {
                id: "first_step",
                name: "First Step",
                desc: "Initiated telemetry node calibration",
                icon: "rocket_launch",
              },
              {
                id: "action_taker",
                name: "Action Taker",
                desc: "Executed 3+ offset protocols",
                icon: "done_all",
              },
              {
                id: "eco_enthusiast",
                name: "Eco Enthusiast",
                desc: "Green Score exceeds 600 XP",
                icon: "nature_people",
              },
              {
                id: "carbon_neutralizer",
                name: "Carbon Neutralizer",
                desc: "Green Score exceeds 800 XP",
                icon: "eco",
              },
              {
                id: "streak_master",
                name: "Streak Master",
                desc: "Maintained active sessions for 3+ consecutive days",
                icon: "electric_bolt",
              },
            ].map((badge) => {
              const isUnlocked = user?.badges?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedItem({ type: "badge", data: badge })}
                  className={`border p-4 bg-surface flex flex-col items-center text-center justify-between relative group transition-all duration-300 cursor-pointer hover:scale-105 ${
                    isUnlocked
                      ? "border-neon-green/80 shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:bg-neon-green/10"
                      : "border-neon-green/10 opacity-40 hover:opacity-100 hover:border-neon-green/50 hover:bg-neon-green/5"
                  }`}
                >
                  <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l border-neon-green"></div>
                  <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b border-r border-neon-green"></div>

                  <div
                    className={`w-12 h-12 border rounded-full flex items-center justify-center mb-3 ${
                      isUnlocked
                        ? "border-neon-green bg-neon-green/10 text-neon-green"
                        : "border-neon-green/20 text-neon-green/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
                  </div>

                  <div>
                    <h3
                      className={`font-mono text-[10px] font-bold uppercase mb-1 ${
                        isUnlocked ? "text-neon-green" : "text-neon-green/40"
                      }`}
                    >
                      {badge.name}
                    </h3>
                    <p className="font-mono text-[8px] text-neon-green/60 leading-tight uppercase px-1">
                      {badge.desc}
                    </p>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`font-mono text-[7px] border px-1 py-0.25 font-bold ${
                        isUnlocked
                          ? "border-neon-amber text-neon-amber bg-neon-amber/5"
                          : "border-neon-green/20 text-neon-green/20"
                      }`}
                    >
                      {isUnlocked ? "DECRYPTED" : "LOCKED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. MISSION_MILESTONES (Gallery) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neon-green/30 pb-2 gap-2">
            <h2 className="font-mono text-lg sm:text-xl md:text-2xl font-extrabold text-neon-green terminal-glow tracking-tighter uppercase">
              MISSION_MILESTONES
            </h2>
            <span className="font-mono text-[10px] text-neon-green/60 uppercase tracking-widest">
              DB_QUERY: STATUS=SUCCESS [{completed.length}_ENTRIES]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {completed.length > 0 ? (
              completed.map((item, i) => (
                <div
                  key={item.actionId || i}
                  onClick={() => setSelectedItem({ type: "milestone", data: item })}
                  className="border border-neon-green/30 bg-surface p-5 hover:border-neon-green hover:bg-neon-green/5 hover:-translate-y-1 transition-all group cursor-pointer relative shadow-sm hover:shadow-[0_4px_15px_rgba(0,255,65,0.15)]"
                >
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 border border-neon-green flex items-center justify-center bg-matrix-dim/10 group-hover:bg-matrix-dim/30 transition-all">
                      <span className="material-symbols-outlined text-neon-green text-3xl">
                        {item.category === "transport"
                          ? "pedal_bike"
                          : item.category === "food"
                            ? "potted_plant"
                            : item.category === "home"
                              ? "light_off"
                              : "recycling"}
                      </span>
                    </div>
                    <span className="font-mono text-[8px] text-neon-green/60 border border-neon-green/30 px-1 py-0.5">
                      {item.category.slice(0, 3).toUpperCase()}_{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-mono text-[13px] font-bold text-neon-green mb-2 tracking-tight uppercase truncate">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[10px] text-neon-green/60 leading-relaxed mb-6 uppercase h-10 overflow-hidden line-clamp-2">
                    {item.notes || "Executed protocol successfully. Impact integrated to grid."}
                  </p>
                  <div className="flex justify-between items-end border-t border-neon-green/20 pt-4">
                    <div className="space-y-1">
                      <span className="block font-mono text-[8px] text-neon-green/60 uppercase">
                        VALIDATED
                      </span>
                      <span className="font-mono text-[10px] text-neon-green">
                        {new Date(item.completedAt).toLocaleDateString().replace(/\//g, "_")}
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="block font-mono text-[8px] text-neon-green/60 uppercase">
                        DELTA
                      </span>
                      <span className="font-mono text-[10px] text-neon-amber">
                        -{item.savingKgPerYear}KG_CO2
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 border border-dashed border-neon-green/30 p-8 text-center text-neon-green/60">
                NO PROTOCOLS EXECUTED YET. ENGAGE NEUTRALIZATION TAB TO BEGIN.
              </div>
            )}
          </div>
        </section>

        {/* 3. BIOSPHERE_INTEGRITY & PROTOCOL_LOG */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-mono text-lg sm:text-xl font-bold text-neon-green terminal-glow tracking-tighter uppercase">
              BIOSPHERE_INTEGRITY
            </h2>
            <div className="space-y-8 border border-neon-green/30 bg-surface p-6 hover:border-neon-green relative">
              <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>

              {/* Target 1 */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-neon-green uppercase">PROTOCOL: ANNUAL_OFFSET_TARGET</span>
                  <span className="text-neon-amber font-bold">
                    {completed.reduce((sum, a) => sum + a.savingKgPerYear, 0)} / 500 KG
                  </span>
                </div>
                <div className="w-full h-3 bg-black border border-neon-green/30">
                  <div
                    className="h-full bg-neon-green shadow-[0_0_10px_#00FF41] transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (completed.reduce((sum, a) => sum + a.savingKgPerYear, 0) / 500) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neon-green/60 uppercase tracking-widest">
                  <span>STAGING: GLOBAL_GRID</span>
                  <span>SYNC_STATUS: ACTIVE</span>
                </div>
              </div>

              {/* Target 2 */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-neon-green uppercase">PROTOCOL: GREEN_SCORE_ELITE</span>
                  <span className="text-neon-amber font-bold">{greenScore} / 1000</span>
                </div>
                <div className="w-full h-3 bg-black border border-neon-green/30">
                  <div
                    className="h-full bg-neon-green shadow-[0_0_10px_#00FF41] transition-all duration-1000"
                    style={{ width: `${Math.min(100, greenScore / 10)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neon-green/60 uppercase tracking-widest">
                  <span>STAGING: OPERATOR_NODE</span>
                  <span>SYNC_STATUS: ENCRYPTED</span>
                </div>
              </div>

              {/* Target 3 */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-neon-green uppercase">PROTOCOL: NODE_STREAK_STABILITY</span>
                  <span className="text-neon-amber font-bold">{streak} / 30 DAYS</span>
                </div>
                <div className="w-full h-3 bg-black border border-neon-green/30">
                  <div
                    className="h-full bg-neon-green shadow-[0_0_10px_#00FF41] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (streak / 30) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neon-green uppercase tracking-widest">
                  <span>STAGING: LOCAL_DOMICILE</span>
                  <span className="animate-pulse">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROTOCOL LOG / Activity Manifest */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-lg sm:text-xl font-bold text-neon-green terminal-glow tracking-tighter uppercase">
                PROTOCOL_LOG_MANIFEST
              </h2>
              <span className="flex items-center gap-2 text-[9px] text-neon-red font-bold animate-pulse">
                <span className="w-2 h-2 bg-neon-red rounded-full"></span> LIVE_FEED
              </span>
            </div>
            <div className="border border-neon-green/30 bg-surface p-4 h-[320px] overflow-y-auto relative">
              <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>

              <div className="font-mono text-[10px] md:text-[11px] space-y-3">
                {sortedActions.length > 0
                  ? sortedActions.map((action, i) => (
                      <div
                        key={action.actionId || i}
                        className="flex gap-4 border-l-2 border-neon-green pl-2 bg-neon-green/5 py-1"
                      >
                        <span className="text-neon-green/60 shrink-0">
                          [
                          {new Date(action.completedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          ]
                        </span>
                        <span className="text-neon-green">
                          EXECUTED: <span className="font-bold">{action.title}</span>{" "}
                          <span className="text-neon-amber ml-2">
                            (-{action.savingKgPerYear}KG)
                          </span>
                        </span>
                      </div>
                    ))
                  : null}

                <div className="flex gap-4 border-l-2 border-neon-green/30 pl-2">
                  <span className="text-neon-green/60 shrink-0">[{currentTimeString}]</span>
                  <span className="text-neon-green">
                    LOG: SYSTEM_SCAN_START ... <span className="font-bold">PASS</span>
                  </span>
                </div>
                <div className="flex gap-4 border-l-2 border-neon-green/30 pl-2 opacity-50">
                  <span className="text-neon-green/60 shrink-0">[{timeOneHourAgoString}]</span>
                  <span className="text-neon-green">AUTO_SAVE: MISSION_DATA_BACKED_UP</span>
                </div>
                <div className="flex gap-4 border-l-2 border-neon-green/30 pl-2">
                  <span className="text-neon-green/60 shrink-0">[00:00:00]</span>
                  <span className="animate-pulse text-neon-green font-bold">
                    &gt; STANDBY_MODE_ACTIVE_0x112
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SYSTEM_RANKING */}
        <section className="border border-neon-green bg-neon-green/5 p-6 relative">
          <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
          <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-mono text-sm font-extrabold text-neon-green uppercase terminal-glow">
                GLOBAL_SYNCHRONIZATION_INDEX
              </h3>
              <p className="font-mono text-[10px] text-neon-green/60 uppercase tracking-wider">
                Your node is currently operating with higher efficiency than {Math.max(1, rank)}% of
                regional operators.
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl md:text-6xl font-black text-neon-green leading-none terminal-glow">
                {rank.toFixed(1)}
              </span>
              <span className="font-mono text-xl text-neon-green/40 font-bold">PTL</span>
            </div>
          </div>
          {/* Data Strip Visualizer */}
          <div className="mt-6 flex h-2 gap-1 overflow-hidden opacity-30">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${i < rank / 10 ? "bg-neon-green" : "bg-neon-green/20"}`}
              ></div>
            ))}
          </div>
        </section>
      </div>

      {/* Interactive Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-surface border-2 border-neon-green p-6 max-w-md w-full relative shadow-[0_0_30px_rgba(0,255,65,0.15)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-neon-green/60 hover:text-neon-green transition-colors"
              onClick={() => setSelectedItem(null)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {selectedItem.type === "badge" && (
              <div className="text-center space-y-6 pt-4">
                <div
                  className={`w-24 h-24 mx-auto border-2 flex items-center justify-center ${user?.badges?.includes(selectedItem.data.id) ? "border-neon-green bg-neon-green/10 text-neon-green shadow-[0_0_15px_#00FF41]" : "border-neon-green/30 text-neon-green/30"}`}
                >
                  <span className="material-symbols-outlined text-5xl">
                    {selectedItem.data.icon}
                  </span>
                </div>
                <div>
                  <h3
                    className={`font-mono text-2xl font-bold uppercase mb-2 ${user?.badges?.includes(selectedItem.data.id) ? "text-neon-green terminal-glow" : "text-neon-green/50"}`}
                  >
                    {selectedItem.data.name}
                  </h3>
                  <p className="font-mono text-xs text-neon-green/80 uppercase px-4 leading-relaxed">
                    {selectedItem.data.desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-neon-green/30">
                  <span
                    className={`font-mono text-[10px] px-3 py-1.5 border font-bold tracking-widest ${user?.badges?.includes(selectedItem.data.id) ? "bg-neon-amber/20 text-neon-amber border-neon-amber" : "bg-black text-neon-green/40 border-neon-green/30"}`}
                  >
                    STATUS:{" "}
                    {user?.badges?.includes(selectedItem.data.id)
                      ? "DECRYPTED_AND_ACTIVE"
                      : "LOCKED_PROTOCOL"}
                  </span>
                </div>
              </div>
            )}

            {selectedItem.type === "milestone" && (
              <div className="space-y-6 pt-2">
                <div className="flex gap-4 items-center border-b border-neon-green/30 pb-4">
                  <div className="w-16 h-16 border-2 border-neon-green flex items-center justify-center bg-matrix-dim/30 text-neon-green shrink-0 shadow-[0_0_10px_#00FF41]">
                    <span className="material-symbols-outlined text-4xl">
                      {selectedItem.data.category === "transport"
                        ? "pedal_bike"
                        : selectedItem.data.category === "food"
                          ? "potted_plant"
                          : selectedItem.data.category === "home"
                            ? "light_off"
                            : "recycling"}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-[9px] text-neon-amber bg-neon-amber/10 border border-neon-amber/30 px-1.5 py-0.5 tracking-wider">
                      {selectedItem.data.category.toUpperCase()}
                    </span>
                    <h3 className="font-mono text-lg font-extrabold text-neon-green tracking-tight uppercase leading-snug">
                      {selectedItem.data.title}
                    </h3>
                  </div>
                </div>
                <div className="bg-black p-4 border border-neon-green/20">
                  <p className="font-mono text-[11px] text-neon-green/90 leading-relaxed uppercase">
                    {selectedItem.data.notes ||
                      selectedItem.data.description ||
                      "Executed protocol successfully. Impact integrated to grid telemetry."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-neon-green/30 bg-neon-green/5 p-3 text-center">
                    <span className="block font-mono text-[9px] text-neon-green/60 uppercase mb-1">
                      VALIDATED
                    </span>
                    <span className="font-mono text-xs text-neon-green font-bold">
                      {new Date(selectedItem.data.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border border-neon-amber/30 bg-neon-amber/5 p-3 text-center">
                    <span className="block font-mono text-[9px] text-neon-amber/60 uppercase mb-1">
                      DELTA_REDUCTION
                    </span>
                    <span className="font-mono text-xs text-neon-amber font-bold">
                      -{selectedItem.data.savingKgPerYear}KG_CO2
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
