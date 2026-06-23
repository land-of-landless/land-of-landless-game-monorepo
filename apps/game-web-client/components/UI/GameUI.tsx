import { Maximize, Minimize, Shield, Coins } from "lucide-react";
import { useGameStore, useGameComputed } from "../../stores/gameStore";

/**
 * Zustand Player Stats Display Panel
 */
export const GameUI = ({
  isFullscreenEnabled,
  toggleFullscreen,
  isFullscreenAvailable,
}: {
  isFullscreenEnabled: boolean;
  toggleFullscreen: () => void;
  isFullscreenAvailable: boolean;
}) => {
  const { health, coins, takeDamage, heal, addCoins, scoreMultiplier } =
    useGameStore();
  const { isDead, healthPercentage, totalScore } = useGameComputed();

  return (
    <div className="absolute top-5 right-5 text-white bg-slate-950/80 border border-slate-700/50 p-4 rounded-xl flex flex-col gap-2 min-w-[220px] z-40 backdrop-blur-md shadow-2xl transition duration-300 hover:border-blue-500/30">
      <h2 className="font-display text-sm font-bold tracking-widest text-yellow-400 flex items-center gap-1.5 uppercase">
        <Shield size={16} className="text-yellow-400 animate-pulse" />
        Citizen Stats
      </h2>

      {/* Health Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 mt-1">
        <div
          className={`h-full ${isDead ? "bg-red-700" : "bg-gradient-to-r from-emerald-500 to-green-400"}`}
          style={{
            width: `${healthPercentage}%`,
            transition: "width 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)",
          }}
        />
      </div>

      <div className="text-xs space-y-1.5 font-mono mt-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Health:</span>
          <span
            className={isDead ? "text-red-500 font-bold" : "text-green-400"}
          >
            {health} / 100 {isDead && "💀"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Treasury Gold:</span>
          <span className="text-yellow-400 font-bold flex items-center gap-0.5">
            <Coins size={12} className="inline text-yellow-400" />
            {coins} 🪙
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-1 text-[11px]">
          <span className="text-slate-400">Score Mult:</span>
          <span className="text-blue-400 font-bold">
            x{scoreMultiplier.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Computed Score:</span>
          <span className="text-cyan-400 font-bold">
            {totalScore.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Manual testing control suite */}
      <div className="flex gap-1.5 mt-2 pointer-events-auto">
        <button
          onClick={() => takeDamage(15)}
          className="bg-red-950/80 border border-red-700/30 text-[10px] text-red-300 py-1 rounded hover:bg-red-900 transition flex-1"
        >
          Damage
        </button>
        <button
          onClick={() => heal(20)}
          className="bg-emerald-950/80 border border-emerald-700/30 text-[10px] text-emerald-300 py-1 rounded hover:bg-emerald-900 transition flex-1"
        >
          Heal
        </button>
        <button
          onClick={() => addCoins(10)}
          className="bg-amber-950/80 border border-amber-700/30 text-[10px] text-amber-300 py-1 rounded hover:bg-amber-900 transition flex-1"
        >
          Gold
        </button>
      </div>

      {isFullscreenAvailable && (
        <button
          onClick={toggleFullscreen}
          className="mt-2.5 flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-xs py-2 rounded-lg font-bold border border-slate-600/50 pointer-events-auto transition cursor-pointer hover:border-blue-400/40"
        >
          {isFullscreenEnabled ? (
            <>
              <Minimize size={14} />
              <span>Minimize Client</span>
            </>
          ) : (
            <>
              <Maximize size={14} />
              <span>Fullscreen Mode</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
