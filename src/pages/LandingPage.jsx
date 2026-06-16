import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function LandingPage() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [bootLogs, setBootLogs] = useState([]);

  const logs = [
    "ECO-LAB OS [Version 2.4.5201]",
    "(c) 2026 Global Citizen Labs. All rights reserved.",
    " ",
    "BOOTING SYSTEM CONSOLE...",
    "NODE CONFIGURED AT LOCATION: ASIA-SOUTH1 [MUMBAI]",
    "ESTABLISHING DATABASE CONNS... OK",
    "CHECKING SECURITY ENCRYPTIONS... AES-256-GCM ACTIVE",
    "SYNCING CARBON COMPLIANCE FACTORS... OK",
    "NODE READY FOR OPERATOR LEVEL ACCESS."
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setBootLogs((prev) => [...prev, logs[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleAction = () => {
    if (user) {
      const onboarded = user.location && user.location.city && user.location.state;
      if (onboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-black">
      <div className="w-full max-w-2xl border-2 border-neon-green bg-surface p-6 font-mono text-xs relative select-none">
        {/* Header telemetry decoration */}
        <div className="absolute top-0 right-0 p-2 text-[8px] text-neon-green/40">REF: 0x99A-OS</div>
        <div className="flex items-center gap-2 mb-6 border-b border-neon-green/30 pb-4">
          <span className="material-symbols-outlined text-xl animate-pulse text-neon-green">terminal</span>
          <span className="font-bold text-lg tracking-widest text-neon-green">ECO-LAB_V2.4</span>
        </div>

        {/* Scrolling logs */}
        <div className="space-y-1 min-h-[160px] text-neon-green mb-8">
          {bootLogs.map((log, i) => (
            <div key={i} className={log?.startsWith?.("(") ? "opacity-60" : ""}>
              {log?.startsWith?.(" ") ? "\u00A0" : `> ${log}`}
            </div>
          ))}
          {bootLogs.length === logs.length && (
            <div className="animate-pulse">_</div>
          )}
        </div>

        {bootLogs.length === logs.length && (
          <div className="space-y-6 animate-fade-in">
            {/* Features summary grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-neon-green/30 py-6">
              <div className="border border-neon-green/30 p-3 bg-black/40">
                <div className="font-bold text-neon-amber text-[10px] mb-1">01 // CALCULATION_ENGINE</div>
                <p className="text-[10px] opacity-75 leading-relaxed">Compute raw transport, food, lpg, and lifestyle variables.</p>
              </div>
              <div className="border border-neon-green/30 p-3 bg-black/40">
                <div className="font-bold text-neon-amber text-[10px] mb-1">02 // CLAUDE_AI_COACH</div>
                <p className="text-[10px] opacity-75 leading-relaxed">Personalized optimization suggestions and synchronization chats.</p>
              </div>
              <div className="border border-neon-green/30 p-3 bg-black/40">
                <div className="font-bold text-neon-amber text-[10px] mb-1">03 // COMPARATIVE_STATS</div>
                <p className="text-[10px] opacity-75 leading-relaxed">Telemetry metrics compared against national averages (India 2.0t).</p>
              </div>
              <div className="border border-neon-green/30 p-3 bg-black/40">
                <div className="font-bold text-neon-amber text-[10px] mb-1">04 // gamification</div>
                <p className="text-[10px] opacity-75 leading-relaxed">Level scaling, streaks, and milestone badges (Seedling to Guardian).</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAction}
                className="w-full border-2 border-neon-green bg-neon-green text-black hover:bg-black hover:text-neon-green py-3 px-4 font-bold uppercase transition-all tracking-wider text-center"
              >
                {user ? 'ENTER_COMMAND_CENTER' : 'CONNECT_TO_NODE'}
              </button>
              
              {!user && (
                <div className="text-[9px] text-center text-neon-green/55">
                   clearance status: unauthenticated. default access keys will generate simulated node.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
