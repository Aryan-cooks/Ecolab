import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export default function Auth() {
  const { login, signup, isLoading, error } = useStore();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password || (isRegister && !displayName)) {
      setLocalError("ERROR: ALL_PARAMETERS_REQUIRED");
      return;
    }

    try {
      if (isRegister) {
        const success = await signup(email, password, displayName);
        if (success) navigate("/onboarding");
      } else {
        const success = await login(email, password);
        if (success) navigate("/dashboard");
      }
    } catch (err) {
      setLocalError("ERROR: SECURITY_HANDSHAKE_FAILED");
    }
  };

  const handleSimulatedLogin = async () => {
    setEmail("operator.alpha@eco-impact.net");
    setPassword("security_code_7");
    setDisplayName("Alex Rivera");

    // Auto-login
    const success = await login(
      "operator.alpha@eco-impact.net",
      "security_code_7",
    );
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-black">
      <div className="w-full max-w-md border-2 border-neon-green bg-surface p-6 font-mono text-xs relative">
        <div className="absolute top-0 right-0 p-2 text-[8px] text-neon-green/40">
          NODE_AUTH: PORT_5000
        </div>

        <div className="flex items-center gap-2 mb-6 border-b border-neon-green/30 pb-4">
          <span className="material-symbols-outlined text-xl text-neon-green">
            shield
          </span>
          <span className="font-bold text-lg tracking-widest text-neon-green">
            {isRegister ? "OPERATOR_REGISTRATION" : "NODE_AUTHENTICATION"}
          </span>
        </div>

        {(localError || error) && (
          <div className="border border-neon-red bg-neon-red/10 text-neon-red p-3 mb-4 font-bold tracking-wide">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-neon-green/60">
                Operator Name (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-sm py-2 px-3 focus:outline-none"
                placeholder="e.g. ALEX RIVERA"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-neon-green/60">
              Operator Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm py-2 px-3 focus:outline-none"
              placeholder="operator@eco-impact.net"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-neon-green/60">
              Clearance Passcode (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm py-2 px-3 focus:outline-none"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full border-2 border-neon-green bg-neon-green text-black hover:bg-black hover:text-neon-green py-2 px-4 font-bold uppercase transition-colors tracking-widest text-sm"
            >
              {isLoading
                ? "SYNCING_WITH_NODE..."
                : isRegister
                  ? "INITIALIZE_OPERATOR"
                  : "VERIFY_KEY_SIGNATURE"}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-neon-green/20">
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">
              {isRegister ? "ALREADY REGISTERED?" : "NEW NODE OPERATOR?"}
            </span>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-neon-amber font-bold underline hover:opacity-85"
            >
              {isRegister ? "DECRYPT_EXISTING" : "INIT_NEW_NODE"}
            </button>
          </div>

          <button
            onClick={handleSimulatedLogin}
            disabled={isLoading}
            className="w-full border border-neon-amber text-neon-amber py-2 px-4 font-bold uppercase hover:bg-neon-amber hover:text-black transition-colors text-center text-[10px] tracking-wider"
          >
            RUN_FAST_BOOT_EMULATOR (DEMO ACCESS)
          </button>
        </div>
      </div>
    </div>
  );
}
