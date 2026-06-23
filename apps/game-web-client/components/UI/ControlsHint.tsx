import { Sparkles } from "lucide-react";

/**
 * Controls Hint Component
 * Top-left floating panel showing keyboard controls
 */

interface ControlsHintProps {
  /** Optional CSS class name */
  className?: string;
}

export const ControlsHint = ({ className = "" }: ControlsHintProps) => {
  return (
    <div
      className={`absolute top-5 left-5 text-white bg-slate-950/70 p-4 rounded-xl border border-slate-700/50 pointer-events-none z-30 backdrop-blur-md ${className}`}
    >
      <h1 className="font-display text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase flex items-center gap-1.5">
        <Sparkles size={16} className="text-cyan-400" />
        LOL: City Hall
      </h1>
      <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
        <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">
          WASD
        </kbd>{" "}
        or
        <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">
          ↑↓←→
        </kbd>{" "}
        : Move
      </p>
      <p className="text-[10px] text-slate-400 font-mono mt-1">
        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">
          SPACE
        </kbd>{" "}
        : Jump
      </p>
      <p className="text-[10px] text-slate-400 font-mono mt-1">
        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">
          SHIFT
        </kbd>{" "}
        : Sprint
      </p>
      <p className="text-[10px] text-slate-400 font-mono mt-1">
        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">
          MOUSE
        </kbd>{" "}
        : Look Around
      </p>
    </div>
  );
};
