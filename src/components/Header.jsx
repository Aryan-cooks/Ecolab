import { useStore } from "../store/useStore";
import { Link } from "react-router-dom";
import DecryptedText from "./DecryptedText";

export default function Header() {
  const { user, offlineMode } = useStore();

  if (!user) return null;

  return (
    <header className="flex justify-between items-center h-16 md:ml-64 px-4 md:px-8 w-full md:w-[calc(100%-256px)] sticky top-0 bg-black border-b-2 border-neon-green z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-2">
        <span className="text-neon-green opacity-40">&gt;&gt;</span>
        <div className="text-xs font-bold tracking-widest text-neon-green flex items-center gap-2">
          <span className="hidden md:inline">SECURE_SESSION: ACTIVE</span>
          <span className="md:hidden">SES_ACTIVE</span>
          {offlineMode && (
            <span className="border border-neon-amber text-neon-amber px-1.5 py-0.5 text-[8px] animate-pulse">
              OFFLINE_MODE
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {user.streakDays > 0 && (
          <Link
            to="/achievements"
            className="flex items-center gap-1.5 border border-neon-amber px-2.5 py-0.5 hover:bg-neon-amber/20 hover:scale-105 cursor-pointer transition-all group"
          >
            <span className="material-symbols-outlined text-neon-amber text-xs group-hover:animate-pulse">
              bolt
            </span>
            <span className="text-[10px] md:text-xs font-bold text-neon-amber">
              <span className="hidden md:inline">
                <DecryptedText text={`${user.streakDays}_DAY_STREAK`} animateOn="hover" />
              </span>
              <span className="md:hidden">
                <DecryptedText text={`${user.streakDays}D_STREAK`} animateOn="hover" />
              </span>
            </span>
          </Link>
        )}

        <Link
          to="/achievements"
          className="flex items-center gap-3 border-l border-neon-green/30 pl-4 md:pl-8 hover:bg-neon-green/10 p-2 -my-2 cursor-pointer transition-all group"
        >
          <div className="text-right">
            <p className="text-xs font-bold text-neon-green group-hover:brightness-125 transition-all truncate max-w-[60px] md:max-w-[120px]">
              <DecryptedText text={user.displayName.toUpperCase()} animateOn="hover" />
            </p>
            <p className="text-[9px] text-neon-amber group-hover:animate-pulse">
              <span className="hidden md:inline">
                <DecryptedText
                  text={`LVL_${Math.max(1, Math.round(user.greenScore / 70))}_${user.level.toUpperCase()}`}
                  animateOn="hover"
                />
              </span>
              <span className="md:hidden">
                <DecryptedText
                  text={`LVL_${Math.max(1, Math.round(user.greenScore / 70))}`}
                  animateOn="hover"
                />
              </span>
            </p>
          </div>
          <div className="w-10 h-10 border-2 border-neon-green p-0.5 bg-black group-hover:shadow-[0_0_8px_#00FF41] group-hover:scale-110 transition-all">
            <img
              alt="User Node"
              className="w-full h-full object-cover grayscale brightness-125 contrast-125 group-hover:grayscale-0 transition-all duration-500"
              src={
                user.photoURL ||
                `https://placehold.co/40x40/000000/00FF41?text=${user.displayName[0].toUpperCase()}`
              }
              onError={(e) => {
                e.target.src = `https://placehold.co/40x40/000000/00FF41?text=${user.displayName[0].toUpperCase()}`;
              }}
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
