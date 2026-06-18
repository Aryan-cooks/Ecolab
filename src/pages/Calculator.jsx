import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { calculateFootprint } from "../utils/calculationEngine";
import BorderGlow from "../components/BorderGlow";
import ElasticSlider from "../components/ElasticSlider";

export default function Calculator() {
  const { saveFootprintResult } = useStore();
  const navigate = useNavigate();

  // Input states
  // Transport
  const [vehicleType, setVehicleType] = useState("petrolCar");
  const [weeklyKm, setWeeklyKm] = useState(140);
  const [transitPercent, setTransitPercent] = useState(20);
  const [flightsPerYear, setFlightsPerYear] = useState(2);

  // Food
  const [dietType, setDietType] = useState("vegetarian");
  const [wasteLevel, setWasteLevel] = useState("medium");
  const [localFoodPercent, setLocalFoodPercent] = useState(30);

  // Home
  const [monthlyKwh, setMonthlyKwh] = useState(220);
  const [lpgCylinders, setLpgCylinders] = useState(1);
  const [homeSize, setHomeSize] = useState(65);

  // Lifestyle
  const [clothingSpend, setClothingSpend] = useState(2500);
  const [screenHours, setScreenHours] = useState(6);
  const [recycling, setRecycling] = useState("partial");

  // Compile inputs and trigger live calculation synchronously
  const inputs = {
    transport: { vehicleType, weeklyKm, transitPercent, flightsPerYear },
    food: { dietType, wasteLevel, localFoodPercent },
    home: {
      monthlyKwh,
      lpgCylindersPerMonth: lpgCylinders,
      homeSizeSqm: homeSize,
    },
    lifestyle: {
      monthlyClothingSpend: clothingSpend,
      screenHoursPerDay: screenHours,
      recyclingHabits: recycling,
    },
  };
  const liveResults = calculateFootprint(inputs);

  const handleSave = async () => {
    await saveFootprintResult(inputs, liveResults);
    navigate("/dashboard");
  };

  const total = liveResults.total || 1;
  const tPct = ((liveResults.breakdown.transport || 0) / total) * 100;
  const fPct = ((liveResults.breakdown.food || 0) / total) * 100;
  const hPct = ((liveResults.breakdown.home || 0) / total) * 100;
  const lPct = ((liveResults.breakdown.lifestyle || 0) / total) * 100;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 grid-line relative min-h-screen">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10 animate-[scan_8s_linear_infinite] pointer-events-none z-10"></div>

      <header className="flex justify-between items-end border-b border-outline pb-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary tracking-tighter break-words">
            [SYSTEM.DATA_ANALYSIS_LAB]
          </h1>
          <p className="text-[10px] sm:text-xs text-secondary mt-1 opacity-80 uppercase tracking-widest break-words">
            Global Emissions Monitoring // Node: 0x244-EcoImpact
          </p>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] text-primary/60">
          <div>LAT: 37.7749° N</div>
          <div>LONG: 122.4194° W</div>
          <div className="text-primary font-bold animate-pulse">STATUS: LIVE_FEED_ACTIVE</div>
        </div>
      </header>

      {/* Mission Control Grid */}
      <div className="grid grid-cols-12 gap-4 max-w-[1400px] mx-auto">
        {/* MODULE: TRANSPORT */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="135 100 50"
          backgroundColor="rgba(18, 18, 20, 0.9)"
          borderRadius={0}
          glowRadius={30}
          glowIntensity={1.0}
          colors={["#00FF41", "#003B00", "#1a4d0f"]}
          className="col-span-12 lg:col-span-6 border border-outline"
        >
          <section className="p-4 relative h-full">
            <div className="absolute top-0 right-0 p-2 text-[10px] text-outline">MOD_01</div>
            <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings_input_antenna</span>
              TRANSPORT_LOGISTICS_MATRIX
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Primary Vehicle Matrix
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                >
                  <option value="petrolCar">Petrol Car (0.21 kg/km)</option>
                  <option value="dieselCar">Diesel Car (0.17 kg/km)</option>
                  <option value="electricCar">Electric 4-Wheeler (0.05 kg/km)</option>
                  <option value="bus">Public Commute Bus</option>
                  <option value="metro">Electric Metro</option>
                  <option value="cycle">Walking/Cycling</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Kilo_Travel_Variable (Weekly)
                </label>
                <input
                  type="number"
                  value={weeklyKm}
                  onChange={(e) => setWeeklyKm(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Transit_Share_Ratio
                </label>
                <div className="pt-2">
                  <ElasticSlider
                    defaultValue={transitPercent}
                    startingValue={0}
                    maxValue={100}
                    onChange={setTransitPercent}
                    formatValue={(val) => `${Math.round(val)}%`}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Aero_Flights (Annual)
                </label>
                <input
                  type="number"
                  value={flightsPerYear}
                  onChange={(e) => setFlightsPerYear(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                />
              </div>

              <div className="col-span-2 mt-2">
                <div className="h-24 w-full border border-outline/50 bg-black/40 flex items-center justify-center relative overflow-hidden">
                  <svg className="absolute opacity-20 w-full h-full" viewBox="0 0 200 100">
                    <path
                      d="M0,50 Q50,0 100,50 T200,50"
                      fill="none"
                      stroke="#00FF41"
                      strokeWidth="0.5"
                    ></path>
                    <path
                      d="M0,60 Q50,10 100,60 T200,60"
                      fill="none"
                      stroke="#00FF41"
                      strokeWidth="0.2"
                    ></path>
                    <circle
                      cx="100"
                      cy="50"
                      fill="none"
                      r="30"
                      stroke="#00FF41"
                      strokeDasharray="2,2"
                      strokeWidth="0.5"
                    ></circle>
                  </svg>
                  <span className="text-[9px] text-primary/40 uppercase">Aero_Dynamics_Pulse</span>
                </div>
              </div>
            </div>
          </section>
        </BorderGlow>

        {/* MODULE: FOOD */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="135 100 50"
          backgroundColor="rgba(18, 18, 20, 0.9)"
          borderRadius={0}
          glowRadius={30}
          glowIntensity={1.0}
          colors={["#00FF41", "#003B00", "#1a4d0f"]}
          className="col-span-12 lg:col-span-6 border border-outline"
        >
          <section className="p-4 relative h-full">
            <div className="absolute top-0 right-0 p-2 text-[10px] text-outline">MOD_02</div>
            <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">biotech</span>
              METHANE_OUTPUT_MATRIX
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Protein_Source_Input
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                >
                  <option value="vegan">PLANT_BASED_ONLY</option>
                  <option value="vegetarian">VEGETARIAN_MATRIX</option>
                  <option value="lowMeat">LOW_BOVINE_INPUT</option>
                  <option value="highMeat">HIGH_METHANE_DIET</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Waste_Residue_Delta
                </label>
                <select
                  value={wasteLevel}
                  onChange={(e) => setWasteLevel(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                >
                  <option value="low">LOW_ORGANIC_WASTE</option>
                  <option value="medium">NOMINAL_OUTPUT</option>
                  <option value="high">EXCESS_RESIDUE_WARNING</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Local_Sourcing_Ratio
                </label>
                <div className="pt-2">
                  <ElasticSlider
                    defaultValue={localFoodPercent}
                    startingValue={0}
                    maxValue={100}
                    onChange={setLocalFoodPercent}
                    formatValue={(val) => `${Math.round(val)}%`}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-4 bg-black/40 p-2 border border-outline/30 mt-2">
                <div className="flex items-end gap-[2px] h-10">
                  <div
                    className="w-[3px] bg-primary animate-[bounce_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-[3px] bg-primary animate-[bounce_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-[3px] bg-primary animate-[bounce_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-[3px] bg-primary animate-[bounce_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="w-[3px] bg-primary animate-[bounce_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <div className="text-[9px] text-secondary leading-tight uppercase">
                  {wasteLevel === "high"
                    ? "Warning: Organic waste exceeds threshold."
                    : "Biological processing nominal."}
                  <br />
                  <span className="text-primary">Optimizing anaerobic digestion...</span>
                </div>
              </div>
            </div>
          </section>
        </BorderGlow>

        {/* MODULE: HOME & ENERGY */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="135 100 50"
          backgroundColor="rgba(18, 18, 20, 0.9)"
          borderRadius={0}
          glowRadius={30}
          glowIntensity={1.0}
          colors={["#00FF41", "#003B00", "#1a4d0f"]}
          className="col-span-12 lg:col-span-8 border border-outline"
        >
          <section className="p-4 relative h-full">
            <div className="absolute top-0 right-0 p-2 text-[10px] text-outline">MOD_03</div>
            <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bolt</span>
              KILOWATT_CONSUMPTION_VARIABLE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-on-surface/60">
                    Power_Draw (kWh)
                  </label>
                  <input
                    type="number"
                    value={monthlyKwh}
                    onChange={(e) => setMonthlyKwh(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-on-surface/60">
                    LPG_Cylinders/Month
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={lpgCylinders}
                    onChange={(e) => setLpgCylinders(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-on-surface/60">Habitation_SqM</label>
                  <input
                    type="number"
                    value={homeSize}
                    onChange={(e) => setHomeSize(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 sm:border-l border-outline sm:pl-6 pt-4 sm:pt-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase text-on-surface/60">
                    Thermal_Efficiency_Index
                  </span>
                  <span className="text-xs text-primary font-bold">
                    {Math.max(30, 100 - monthlyKwh / 10).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-outline rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary shadow-[0_0_8px_#00FF41] transition-all duration-500"
                    style={{ width: `${Math.max(30, 100 - monthlyKwh / 10)}%` }}
                  ></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-black/40 border border-outline p-2">
                    <div className="text-[8px] text-on-surface/50 uppercase">HVAC_LOAD_EST</div>
                    <div className="text-xs font-bold text-secondary">
                      {(monthlyKwh * 0.6).toFixed(1)}kW/h
                    </div>
                  </div>
                  <div className="bg-black/40 border border-outline p-2">
                    <div className="text-[8px] text-on-surface/50 uppercase">LUX_DEMAND_EST</div>
                    <div className="text-xs font-bold text-primary">
                      {(monthlyKwh * 0.15).toFixed(1)}kW/h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </BorderGlow>

        {/* MODULE: LIFESTYLE */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="135 100 50"
          backgroundColor="rgba(18, 18, 20, 0.9)"
          borderRadius={0}
          glowRadius={30}
          glowIntensity={1.0}
          colors={["#00FF41", "#003B00", "#1a4d0f"]}
          className="col-span-12 lg:col-span-4 border border-outline"
        >
          <section className="p-4 relative h-full">
            <div className="absolute top-0 right-0 p-2 text-[10px] text-outline">MOD_04</div>
            <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              CONSUMPTION_COEFFICIENT
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Material_Spend_Rate (INR)
                </label>
                <input
                  type="number"
                  value={clothingSpend}
                  onChange={(e) => setClothingSpend(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Screen_Uptime_Cycles (Hours/Day)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={screenHours}
                  onChange={(e) =>
                    setScreenHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))
                  }
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-on-surface/60">
                  Recycle_Buffer_Status
                </label>
                <select
                  value={recycling}
                  onChange={(e) => setRecycling(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-surface border border-outline focus:border-primary text-primary focus:outline-none"
                >
                  <option value="none">NULL_DIVERSION</option>
                  <option value="partial">PARTIAL_SORT_ALGORITHM</option>
                  <option value="full">MAXIMUM_LOOP_RECOVERY</option>
                </select>
              </div>
              <div className="pt-2 border-t border-outline/30">
                <p className="text-[9px] text-on-surface/70 leading-relaxed italic">
                  {clothingSpend > 5000
                    ? '"System detected high frequency of material acquisition. Suggesting reduction."'
                    : '"Material intake nominal."'}
                </p>
              </div>
            </div>
          </section>
        </BorderGlow>

        {/* LIVE CALCULATOR OUTPUT */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="135 100 50"
          backgroundColor="rgba(0, 0, 0, 0.9)"
          borderRadius={0}
          glowRadius={35}
          glowIntensity={1.2}
          colors={["#00FF41", "#003B00", "#1a4d0f"]}
          className="col-span-12 border-2 border-primary"
        >
          <section className="p-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-3 bg-primary text-background font-black text-[10px] z-10">
              REAL_TIME_ANALYSIS
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="text-xs text-primary/60 uppercase font-bold tracking-widest">
                  Total_Annual_CO2e_Delta
                </div>
                <div className="text-6xl md:text-7xl font-black text-primary leading-none tracking-tighter">
                  {liveResults.totalTons.toFixed(1)}
                  <span className="text-2xl ml-2 font-normal">t</span>
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-12 text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                <div className="flex-1 md:flex-none">
                  <div className="text-[10px] text-secondary uppercase">Local_Average</div>
                  <div className="text-xl font-bold">2.0t</div>
                </div>
                <div className="flex-1 md:flex-none">
                  <div className="text-[10px] text-accent-blue uppercase">Green_Score</div>
                  <div className="text-xl font-bold">{liveResults.greenScore}</div>
                </div>
                <div className="flex-1 md:flex-none border-l border-outline pl-6">
                  <div className="text-[10px] text-primary uppercase underline">
                    EFFICIENCY_RANK
                  </div>
                  <div className="text-xl font-bold text-primary">
                    #{liveResults.level.toUpperCase().slice(0, 4)}-
                    {Math.round(liveResults.percentileRank)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Visualization */}
            <div className="mt-8 flex h-4 border border-outline bg-surface">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${tPct}%` }}
                title={`TRANSPORT: ${Math.round(tPct)}%`}
              ></div>
              <div
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${fPct}%` }}
                title={`FOOD: ${Math.round(fPct)}%`}
              ></div>
              <div
                className="h-full bg-accent-blue transition-all duration-500"
                style={{ width: `${hPct}%` }}
                title={`HOME: ${Math.round(hPct)}%`}
              ></div>
              <div
                className="h-full bg-on-surface/40 transition-all duration-500"
                style={{ width: `${lPct}%` }}
                title={`LIFESTYLE: ${Math.round(lPct)}%`}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-[8px] text-on-surface/40 uppercase font-bold">
              <span>Transport</span>
              <span>Food</span>
              <span>Energy</span>
              <span>Consumption</span>
            </div>
          </section>
        </BorderGlow>
      </div>

      <footer className="mt-8 flex flex-col sm:flex-row justify-between items-center border-t border-outline pt-4 gap-4">
        <div className="text-[10px] uppercase opacity-50 hidden sm:block">
          Encryption: AES-256-GCM
        </div>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto py-3 px-8 bg-primary text-background font-black text-xs uppercase tracking-tighter hover:bg-white transition-colors"
        >
          FORCE_SAVE_SNAPSHOT
        </button>
        <div className="text-[10px] uppercase flex gap-4 opacity-50">
          <span className="text-primary hover:underline cursor-pointer">System_Reboot</span>
          <span className="text-alert-red hover:underline cursor-pointer">Abort_Process</span>
        </div>
      </footer>
    </main>
  );
}
