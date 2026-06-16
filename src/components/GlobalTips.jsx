import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GlobalTips() {
  const [currentTip, setCurrentTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const fetchTip = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ai/tips');
      if (res.data && res.data.tip) {
        setCurrentTip(res.data.tip);
        setIsVisible(true);
        setIsExiting(false);
        
        // Hide after 8 seconds
        setTimeout(() => {
          triggerExit();
        }, 8000);
      }
    } catch (err) {
      console.error('Failed to fetch tip', err);
    }
  };

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setCurrentTip(null);
    }, 500); // 500ms duration for exit animation to complete
  };

  useEffect(() => {
    // Show a tip every 45 seconds
    const interval = setInterval(() => {
      fetchTip();
    }, 45000);

    // Initial tip after 10 seconds
    const initialTimeout = setTimeout(() => {
      fetchTip();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!isVisible || !currentTip) return null;

  return (
    <div 
      className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[100] max-w-sm bg-surface border-2 border-neon-green p-4 shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all duration-500 transform ${isExiting ? 'opacity-0 translate-y-8 scale-95 blur-sm' : 'opacity-100 translate-y-0 scale-100 blur-none'}`}
      style={{ animation: isExiting ? 'none' : 'fadeIn 0.3s ease-out' }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-neon-green mt-0.5 animate-pulse">tips_and_updates</span>
        <div className="flex-1">
          <h4 className="text-[10px] md:text-xs font-bold text-neon-amber uppercase tracking-widest mb-1">[ SYSTEM_TIP ]</h4>
          <p className="text-xs text-neon-green leading-relaxed">{currentTip}</p>
        </div>
        <button 
          onClick={triggerExit}
          className="text-neon-green hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
