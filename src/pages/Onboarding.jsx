import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import BorderGlow from "../components/BorderGlow";

export default function Onboarding() {
  const { user, updateProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form states
  const [city, setCity] = useState(user?.location?.city || "Durgapur");
  const [state, setState] = useState(user?.location?.state || "West Bengal");
  const [householdSize, setHouseholdSize] = useState(user?.householdSize || 3);
  const [homeType, setHomeType] = useState(user?.homeType || "apartment");
  const [primaryCommute, setPrimaryCommute] = useState(user?.primaryCommute || "transit");
  const [dietType, setDietType] = useState(user?.dietType || "vegetarian");
  const [primaryGoal, setPrimaryGoal] = useState(
    user?.primaryGoal || "Reduce emissions 20% this year",
  );

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save profile and redirect to calculator
      const profile = {
        location: { city, state, country: "IN" },
        householdSize,
        homeType,
        primaryCommute,
        dietType,
        primaryGoal,
      };
      await updateProfile(profile);
      navigate("/calculator");
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-transparent relative overflow-hidden">
      <BorderGlow
        edgeSensitivity={30}
        glowColor="135 100 50"
        backgroundColor="rgba(18, 18, 20, 0.9)"
        borderRadius={0}
        glowRadius={40}
        glowIntensity={1.2}
        colors={["#00FF41", "#003B00", "#1a4d0f"]}
        className="w-full max-w-xl z-10 border-2 border-neon-green backdrop-blur-sm"
      >
        <div className="p-6 font-mono text-xs relative">
          <div className="absolute top-0 right-0 p-2 text-[8px] text-neon-green/40">
            STEP_0{step}_OF_04
          </div>

          {/* Step 1: Welcome Screen */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-lg sm:text-xl font-bold text-neon-green terminal-glow border-b border-neon-green/30 pb-3 break-words">
                [ INITIAL_NODE_ONBOARDING ]
              </h1>
              <p className="text-sm leading-relaxed">
                WELCOME TO CARBONCOACH,{" "}
                <span className="text-neon-amber font-bold">
                  {user?.displayName?.toUpperCase()}
                </span>
                !
              </p>
              <p className="text-xs leading-relaxed opacity-80">
                LET'S MAP YOUR CARBON TELEMETRY. WE WILL DIAGNOSE YOUR WEEKLY CO2e OUTFLOWS AND
                ESTABLISH OPTIMIZATION PROTOCOLS TO ENFORCE COMPLIANCE INDEXING.
              </p>
              <div className="pt-4 border-t border-neon-green/20">
                <button
                  onClick={handleNext}
                  className="w-full border-2 border-neon-green bg-neon-green text-black hover:bg-black hover:text-neon-green py-3 font-bold uppercase transition-colors"
                >
                  INITIALIZE_TELEMETRY (GET STARTED)
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location & Household */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-neon-green terminal-glow border-b border-neon-green/30 pb-3">
                02 // ENVIRONMENT_CONSTANTS
              </h1>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Operator City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Operator State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-neon-green/60">
                  Household Occupancy Size
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      key={size}
                      onClick={() => setHouseholdSize(size)}
                      className={`flex-1 border py-2 text-xs font-bold transition-all ${
                        householdSize === size
                          ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
                          : "border-neon-green/35 text-neon-green hover:border-neon-green"
                      }`}
                    >
                      {size === 4 ? "4+" : size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-neon-green/60">
                  Residential Unit Type
                </label>
                <div className="flex gap-2">
                  {["apartment", "house", "other"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setHomeType(type)}
                      className={`flex-1 border py-2 text-[10px] font-bold uppercase transition-all ${
                        homeType === type
                          ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
                          : "border-neon-green/35 text-neon-green hover:border-neon-green"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-neon-green/20">
                <button
                  onClick={handlePrev}
                  className="flex-1 border-2 border-neon-green py-2.5 font-bold uppercase hover:bg-neon-green hover:text-black transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 border-2 border-neon-green bg-neon-green text-black py-2.5 font-bold uppercase hover:bg-black hover:text-neon-green transition-colors"
                >
                  PROCEED
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Commute & Diet */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-neon-green terminal-glow border-b border-neon-green/30 pb-3">
                03 // LIFESTYLE_SNAPSHOT
              </h1>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-neon-green/60">
                  Primary Transportation Vector
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "car", name: "Private Vehicle (Car)" },
                    { id: "transit", name: "Public Transit (Bus/Metro)" },
                    { id: "wfh", name: "No Commute (WFH)" },
                    { id: "cycle", name: "Cycling / Active Travel" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setPrimaryCommute(mode.id)}
                      className={`border p-2.5 text-left text-[10px] font-bold uppercase transition-all ${
                        primaryCommute === mode.id
                          ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
                          : "border-neon-green/35 text-neon-green hover:border-neon-green"
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-neon-green/60">
                  Dietary Profile (Methane/Nitrous Factor)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "vegan", name: "Vegan" },
                    { id: "vegetarian", name: "Vegetarian" },
                    { id: "lowMeat", name: "Low Meat" },
                    { id: "highMeat", name: "High Meat" },
                  ].map((diet) => (
                    <button
                      key={diet.id}
                      onClick={() => setDietType(diet.id)}
                      className={`border py-2 text-[9px] font-bold uppercase transition-all ${
                        dietType === diet.id
                          ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
                          : "border-neon-green/35 text-neon-green hover:border-neon-green"
                      }`}
                    >
                      {diet.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-neon-green/20">
                <button
                  onClick={handlePrev}
                  className="flex-1 border-2 border-neon-green py-2.5 font-bold uppercase hover:bg-neon-green hover:text-black transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 border-2 border-neon-green bg-neon-green text-black py-2.5 font-bold uppercase hover:bg-black hover:text-neon-green transition-colors"
                >
                  PROCEED
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Motivation */}
          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-neon-green terminal-glow border-b border-neon-green/30 pb-3">
                04 // MOTIVATION_COEFFICIENT
              </h1>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-neon-green/60">
                  Primary Sustainability Target Goal
                </label>
                <div className="space-y-2">
                  {[
                    "Understand my baseline footprint parameters",
                    "Reduce emissions 20% this calendar year",
                    "Become fully carbon neutral (Zero Net Outflow)",
                  ].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setPrimaryGoal(goal)}
                      className={`w-full border p-3 text-left text-[10px] font-bold uppercase transition-all ${
                        primaryGoal === goal
                          ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
                          : "border-neon-green/35 text-neon-green hover:border-neon-green"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-neon-green/20">
                <button
                  onClick={handlePrev}
                  className="flex-1 border-2 border-neon-green py-2.5 font-bold uppercase hover:bg-neon-green hover:text-black transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 border-2 border-neon-green bg-neon-green text-black py-2.5 font-bold uppercase hover:bg-black hover:text-neon-green transition-colors"
                >
                  COMPILE_PROFILE_DATA
                </button>
              </div>
            </div>
          )}
        </div>
      </BorderGlow>
    </div>
  );
}
