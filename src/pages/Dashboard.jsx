import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import BorderGlow from "../components/BorderGlow";

export default function Dashboard() {
  const {
    user,
    footprint,
    suggestions,
    fetchSuggestions,
    completeAction,
    dismissSuggestion,
    completeWeeklyChallenge,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const userGreenScore = user?.greenScore || 0;
  let computedLevel = "seedling";
  if (userGreenScore >= 750) computedLevel = "guardian";
  else if (userGreenScore >= 500) computedLevel = "tree";
  else if (userGreenScore >= 250) computedLevel = "sapling";

  // Fallback to actual user score or zeroed footprint if not loaded
  const fp = footprint || {
    breakdown: { transport: 0, food: 0, home: 0, lifestyle: 0 },
    total: 0,
    totalTons: 0,
    greenScore: userGreenScore,
    level: user?.level || computedLevel,
    nationalAverageIndia: 2000,
    percentileRank: 0,
  };

  const breakdown = fp.breakdown || {};
  const total = fp.total || 1;
  const transportPct = Math.round(((breakdown.transport || 0) / total) * 100);
  const foodPct = Math.round(((breakdown.food || 0) / total) * 100);
  const homePct = Math.round(((breakdown.home || 0) / total) * 100);
  const lifestylePct = Math.round(((breakdown.lifestyle || 0) / total) * 100);

  // Active suggestions to show (limit to 3, pending only)
  const pendingSuggestions = suggestions
    ? suggestions.filter((s) => s.status === "pending").slice(0, 3)
    : [];

  const handleExecute = async (suggestion) => {
    await completeAction(suggestion.id, {
      title: suggestion.title,
      category: suggestion.category,
      savingKgPerYear: suggestion.savingKgPerYear,
      difficulty: suggestion.difficulty,
      source: suggestion.source || "ai_suggestion",
      notes: suggestion.notes || suggestion.description || null,
    });
  };

  const handleDismiss = (id) => {
    dismissSuggestion(id);
  };

  return (
    <main className="p-4 md:p-6 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Telemetry Row */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Monolithic Metric */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="135 100 50"
            backgroundColor="rgba(18, 18, 20, 0.9)"
            borderRadius={0}
            glowRadius={35}
            glowIntensity={1.1}
            colors={["#00FF41", "#003B00", "#1a4d0f"]}
            className="col-span-12 lg:col-span-8 border-2 border-neon-green"
          >
            <div className="p-6 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">hub</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-12 gap-4">
                <div>
                  <h2 className="text-xs font-bold text-neon-amber mb-2 break-words">
                    [ EMISSION_VECTOR_ANALYTICS ]
                  </h2>
                  <div className="flex items-baseline gap-2 sm:gap-4">
                    <span className="text-5xl sm:text-6xl md:text-8xl font-black terminal-glow">
                      {fp.totalTons}
                    </span>
                    <span className="text-xs sm:text-sm md:text-xl opacity-60">
                      TONS_CO2E / ANNUM
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right border border-neon-green p-2 bg-matrix-dim w-full sm:w-auto">
                  <p className="text-[9px] mb-1">CURRENT_STATUS</p>
                  <p
                    className={`text-xs md:text-sm font-bold animate-pulse ${fp.greenScore >= 600 ? "text-neon-green" : "text-neon-amber"}`}
                  >
                    {fp.greenScore >= 750
                      ? "LOW_FOOTPRINT_CONFIRMED"
                      : fp.greenScore >= 500
                        ? "NOMINAL_COMPLIANCE"
                        : "EXCESS_EMISSION_WARNING"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-[10px] md:text-xs flex-col sm:flex-row gap-2">
                  <span>
                    GLOBAL_VARIANCE: {fp.greenScore >= 600 ? "-15% [OPTIMAL]" : "+12% [WARNING]"}
                  </span>
                  <span>TARGET_THRESHOLD: 2.0T</span>
                </div>
                <div className="w-full h-8 border border-neon-green relative">
                  <div
                    className="bg-neon-green h-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, fp.percentileRank))}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold z-10">
                    <span className="bg-black text-neon-green px-2 py-1 border border-neon-green">
                      COMPLIANCE_LEVEL: {fp.percentileRank.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </BorderGlow>

          {/* System Logs & Metrics */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 md:gap-6">
            <BorderGlow
              edgeSensitivity={30}
              glowColor="135 100 50"
              backgroundColor="rgba(18, 18, 20, 0.9)"
              borderRadius={0}
              glowRadius={25}
              glowIntensity={1.0}
              colors={["#00FF41", "#003B00", "#1a4d0f"]}
              className="border-2 border-neon-green"
            >
              <div className="p-6 flex flex-col justify-center items-center h-full">
                <p className="text-[10px] md:text-xs mb-4 text-neon-amber">
                  GREEN_SCORE_COEFFICIENT
                </p>
                <div className="relative w-28 h-28 border-4 border-neon-green rounded-full flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black terminal-glow">
                    {fp.greenScore}
                  </span>
                  <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-[-90deg]">
                    <circle
                      className="text-matrix-dim"
                      cx="58"
                      cy="58"
                      fill="transparent"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <circle
                      className="text-neon-green"
                      cx="58"
                      cy="58"
                      fill="transparent"
                      r="54"
                      stroke="currentColor"
                      strokeDasharray="339"
                      strokeDashoffset={339 - (339 * fp.greenScore) / 1000}
                      strokeWidth="4"
                    ></circle>
                  </svg>
                </div>
              </div>
            </BorderGlow>

            <BorderGlow
              edgeSensitivity={30}
              glowColor="135 100 50"
              backgroundColor="rgba(18, 18, 20, 0.9)"
              borderRadius={0}
              glowRadius={25}
              glowIntensity={1.0}
              colors={["#00FF41", "#003B00", "#1a4d0f"]}
              className="border-2 border-neon-green"
            >
              <div className="p-6 flex items-center gap-6 h-full">
                <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-neon-green flex items-center justify-center bg-matrix-dim shrink-0">
                  <span className="material-symbols-outlined text-3xl text-neon-green">shield</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] md:text-[10px] text-neon-amber">SECURITY_RANK</p>
                  <h3 className="text-lg md:text-xl font-bold truncate">
                    {fp.level.toUpperCase()}
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold text-neon-green">
                    NODE_LEVEL: {Math.max(1, Math.round(fp.greenScore / 70))}.00
                  </p>
                </div>
              </div>
            </BorderGlow>

            {user?.weeklyChallenge && (
              <BorderGlow
                edgeSensitivity={30}
                glowColor="42 100 50"
                backgroundColor="rgba(18, 18, 20, 0.9)"
                borderRadius={0}
                glowRadius={25}
                glowIntensity={1.0}
                colors={["#FFB100", "#7c2d12", "#451a03"]}
                className="border-2 border-neon-amber"
              >
                <div className="p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-2 text-[8px] text-neon-amber font-bold">
                    XP_BONUS: +100
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs mb-2 text-neon-amber uppercase tracking-widest">
                      [ WEEKLY_CHALLENGE ]
                    </p>
                    <h4 className="text-xs font-bold text-white uppercase mb-4 leading-relaxed">
                      {user.weeklyChallenge.title}
                    </h4>
                  </div>
                  {user.weeklyChallenge.completed ? (
                    <div className="border border-neon-green bg-neon-green/10 text-neon-green text-center py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      CHALLENGE_COMPLETED
                    </div>
                  ) : (
                    <button
                      onClick={completeWeeklyChallenge}
                      className="w-full border-2 border-neon-amber text-neon-amber hover:bg-neon-amber hover:text-black py-2 font-mono text-[10px] font-bold uppercase transition-all tracking-wider"
                    >
                      MARK_AS_RESOLVED
                    </button>
                  )}
                </div>
              </BorderGlow>
            )}
          </div>
        </div>

        {/* Data Matrix Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Breakdown Matrix */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="135 100 50"
            backgroundColor="rgba(18, 18, 20, 0.9)"
            borderRadius={0}
            glowRadius={35}
            glowIntensity={1.1}
            colors={["#00FF41", "#003B00", "#1a4d0f"]}
            className="col-span-12 md:col-span-7 border-2 border-neon-green"
          >
            <div className="p-4 md:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-neon-green pb-2">
                  <h3 className="text-xs md:text-sm font-bold break-words">
                    [ SUB-SECTOR_TELEMETRY ]
                  </h3>
                  <span className="text-[8px] md:text-[10px] text-neon-green animate-pulse">
                    STREAMING LIVE...
                  </span>
                </div>
                <div className="space-y-6 telemetry-scroll max-h-[300px] overflow-y-auto pr-2 md:pr-4">
                  {/* Transport */}
                  <div className="group cursor-crosshair hover:bg-neon-green/10 p-2 -mx-2 transition-all border border-transparent hover:border-neon-green/30">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-[10px] md:text-xs font-bold group-hover:text-white transition-colors">
                          01_TRANSPORT
                        </span>
                        <span className="text-[8px] md:text-[9px] opacity-40 group-hover:opacity-80 transition-opacity">
                          V_ID: CAR_99
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-neon-green group-hover:scale-110 origin-right transition-transform">
                        {(breakdown.transport / 1000).toFixed(2)}T [{transportPct}%]
                      </span>
                    </div>
                    <div className="flex gap-1 h-3 group-hover:h-4 transition-all">
                      <div
                        className="bg-neon-green group-hover:brightness-125 group-hover:shadow-[0_0_8px_#00FF41] transition-all"
                        style={{ width: `${transportPct}%` }}
                      ></div>
                      <div className="bg-matrix-dim flex-1"></div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="group cursor-crosshair hover:bg-neon-green/10 p-2 -mx-2 transition-all border border-transparent hover:border-neon-green/30">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-[10px] md:text-xs font-bold group-hover:text-white transition-colors">
                          02_NUTRITION
                        </span>
                        <span className="text-[8px] md:text-[9px] opacity-40 group-hover:opacity-80 transition-opacity">
                          V_ID: NUT_12
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-neon-green group-hover:scale-110 origin-right transition-transform">
                        {(breakdown.food / 1000).toFixed(2)}T [{foodPct}%]
                      </span>
                    </div>
                    <div className="flex gap-1 h-3 group-hover:h-4 transition-all">
                      <div
                        className="bg-neon-green group-hover:brightness-125 group-hover:shadow-[0_0_8px_#00FF41] transition-all"
                        style={{ width: `${foodPct}%` }}
                      ></div>
                      <div className="bg-matrix-dim flex-1"></div>
                    </div>
                  </div>

                  {/* Home */}
                  <div className="group cursor-crosshair hover:bg-neon-green/10 p-2 -mx-2 transition-all border border-transparent hover:border-neon-green/30">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-[10px] md:text-xs font-bold group-hover:text-white transition-colors">
                          03_RESIDENTIAL
                        </span>
                        <span className="text-[8px] md:text-[9px] opacity-40 group-hover:opacity-80 transition-opacity">
                          V_ID: DOM_04
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-neon-green group-hover:scale-110 origin-right transition-transform">
                        {(breakdown.home / 1000).toFixed(2)}T [{homePct}%]
                      </span>
                    </div>
                    <div className="flex gap-1 h-3 group-hover:h-4 transition-all">
                      <div
                        className="bg-neon-green group-hover:brightness-125 group-hover:shadow-[0_0_8px_#00FF41] transition-all"
                        style={{ width: `${homePct}%` }}
                      ></div>
                      <div className="bg-matrix-dim flex-1"></div>
                    </div>
                  </div>

                  {/* Lifestyle */}
                  <div className="group cursor-crosshair hover:bg-neon-green/10 p-2 -mx-2 transition-all border border-transparent hover:border-neon-green/30">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-[10px] md:text-xs font-bold group-hover:text-white transition-colors">
                          04_EXTERNALS
                        </span>
                        <span className="text-[8px] md:text-[9px] opacity-40 group-hover:opacity-80 transition-opacity">
                          V_ID: EXT_01
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-neon-green group-hover:scale-110 origin-right transition-transform">
                        {(breakdown.lifestyle / 1000).toFixed(2)}T [{lifestylePct}%]
                      </span>
                    </div>
                    <div className="flex gap-1 h-3 group-hover:h-4 transition-all">
                      <div
                        className="bg-neon-green group-hover:brightness-125 group-hover:shadow-[0_0_8px_#00FF41] transition-all"
                        style={{ width: `${lifestylePct}%` }}
                      ></div>
                      <div className="bg-matrix-dim flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-neon-green/30 text-[8px] md:text-[9px] flex gap-2 md:gap-4 flex-wrap text-neon-amber">
                <span>[LOG] CALC_CRC: OK</span>
                <span>[LOG] VECTOR_SYNC: 100%</span>
                <span>[LOG] DATA_FETCH: 0.002ms</span>
              </div>
            </div>
          </BorderGlow>

          {/* Comparative Engine */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="135 100 50"
            backgroundColor="rgba(18, 18, 20, 0.9)"
            borderRadius={0}
            glowRadius={35}
            glowIntensity={1.1}
            colors={["#00FF41", "#003B00", "#1a4d0f"]}
            className="col-span-12 md:col-span-5 border-2 border-neon-green"
          >
            <div className="p-4 md:p-6 h-full flex flex-col justify-between">
              <h3 className="text-xs md:text-sm font-bold mb-8 border-b border-neon-green pb-2 break-words">
                [ PEER_NODE_COMPARISON ]
              </h3>
              <div className="flex-1 flex items-end justify-around gap-2 md:gap-4 pb-4 px-2 md:px-4 min-h-[200px]">
                <div className="flex flex-col items-center gap-2 w-full max-w-[60px] group cursor-pointer hover:-translate-y-2 transition-transform">
                  <div className="text-[9px] font-bold group-hover:text-white group-hover:scale-125 transition-all">
                    {fp.totalTons}
                  </div>
                  <div
                    className="w-full bg-neon-green transition-all duration-500 border border-neon-green group-hover:shadow-[0_0_15px_#00FF41] group-hover:bg-white"
                    style={{
                      height: `${Math.min(180, (fp.totalTons / 8) * 180)}px`,
                    }}
                  ></div>
                  <span className="text-[8px] font-bold text-center group-hover:text-white transition-colors">
                    NODE_01
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full max-w-[60px] group cursor-pointer hover:-translate-y-2 transition-transform">
                  <div className="text-[9px] font-bold text-neon-amber group-hover:text-white group-hover:scale-125 transition-all">
                    2.0
                  </div>
                  <div
                    className="w-full border-2 border-neon-amber border-dashed transition-all duration-500 group-hover:bg-neon-amber group-hover:shadow-[0_0_15px_#FFB100]"
                    style={{ height: `${(2.0 / 8) * 180}px` }}
                  ></div>
                  <span className="text-[8px] font-bold opacity-60 text-center group-hover:text-neon-amber group-hover:opacity-100 transition-all">
                    IN_AVG
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full max-w-[60px] group cursor-pointer hover:-translate-y-2 transition-transform">
                  <div className="text-[9px] font-bold text-neon-green/50 group-hover:text-white group-hover:scale-125 transition-all">
                    6.8
                  </div>
                  <div
                    className="w-full border border-neon-green/50 border-dotted transition-all duration-500 group-hover:bg-neon-green/50 group-hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                    style={{ height: `${(6.8 / 8) * 180}px` }}
                  ></div>
                  <span className="text-[8px] font-bold opacity-45 text-center group-hover:text-neon-green group-hover:opacity-100 transition-all">
                    GLO_AVG
                  </span>
                </div>
              </div>
              <div className="mt-6 p-3 border border-neon-green bg-matrix-dim/50">
                <p className="text-[9px] md:text-[10px] leading-relaxed">
                  SYSTEM_INSIGHT: DELTA DETECTED [
                  <span className="text-neon-amber">
                    {(fp.totalTons - 2.0).toFixed(1)} TONS VS IND
                  </span>
                  ]. SUSTAINABILITY_PROTOCOL_ENFORCED. CURRENT_EFFICIENCY:{" "}
                  {fp.totalTons > 2.0 ? "NEEDS_OPTIMIZATION" : "OPTIMAL"}.
                </p>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* Optimization Protocols */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs md:text-sm font-bold break-words">
              [ CARBON_NEUTRALIZATION_PROTOCOL ]
            </h3>
            <button
              onClick={() => navigate("/suggestions")}
              className="text-[9px] text-neon-amber underline font-bold uppercase hover:opacity-80"
            >
              VIEW_ALL_PROTOCOLS ({suggestions.length})
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {pendingSuggestions.length > 0 ? (
              pendingSuggestions.map((item) => (
                <div
                  key={item.id}
                  className={`border-2 p-5 bg-surface hover:bg-matrix-dim transition-all group flex flex-col justify-between ${
                    item.difficulty === "Hard"
                      ? "border-neon-red"
                      : item.difficulty === "Medium"
                        ? "border-neon-amber"
                        : "border-neon-green"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`material-symbols-outlined ${item.difficulty === "Hard" ? "text-neon-red" : item.difficulty === "Medium" ? "text-neon-amber" : "text-neon-green"}`}
                      >
                        {item.category === "transport"
                          ? "pedal_bike"
                          : item.category === "food"
                            ? "restaurant"
                            : item.category === "home"
                              ? "nest_eco_leaf"
                              : "shopping_bag"}
                      </span>
                      <span
                        className={`border px-2 py-0.5 text-[8px] font-bold ${
                          item.difficulty === "Hard"
                            ? "border-neon-red text-neon-red"
                            : item.difficulty === "Medium"
                              ? "border-neon-amber text-neon-amber"
                              : "border-neon-green text-neon-green"
                        }`}
                      >
                        {item.difficulty.toUpperCase()} // {item.timeToImplement.toUpperCase()}
                      </span>
                    </div>
                    <h4
                      className={`text-xs font-bold mb-3 uppercase ${item.difficulty === "Hard" ? "text-neon-red" : item.difficulty === "Medium" ? "text-neon-amber" : "text-neon-green"}`}
                    >
                      INIT: {item.title}
                    </h4>
                    <p className="text-[10px] opacity-70 mb-6 min-h-[40px] uppercase leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-6 text-neon-amber">
                      <span className="material-symbols-outlined text-xs">reduction</span>
                      <span className="text-[9px] font-bold">
                        REDUCTION_EST: -{item.savingKgPerYear}KG/YR
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleExecute(item)}
                        className={`w-full border py-2 text-[9px] font-bold hover:text-black transition-colors ${
                          item.difficulty === "Hard"
                            ? "border-neon-red hover:bg-neon-red text-neon-red"
                            : item.difficulty === "Medium"
                              ? "border-neon-amber hover:bg-neon-amber text-neon-amber"
                              : "border-neon-green hover:bg-neon-green text-neon-green"
                        }`}
                      >
                        EXECUTE_PROTOCOL
                      </button>
                      <button
                        onClick={() => handleDismiss(item.id)}
                        className={`w-full border py-2 text-[9px] font-bold opacity-40 hover:opacity-100 transition-opacity ${
                          item.difficulty === "Hard"
                            ? "border-neon-red/30"
                            : item.difficulty === "Medium"
                              ? "border-neon-amber/30"
                              : "border-neon-green/30"
                        }`}
                      >
                        ABORT_PATH
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 border border-dashed border-neon-green/30 p-8 text-center text-neon-green/60">
                NO ACTIVE RECOMMENDATION PROTOCOLS DISCOVERED.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
