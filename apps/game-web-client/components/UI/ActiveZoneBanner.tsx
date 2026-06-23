import { Volume2, FileText } from "lucide-react";
import { ZoneInfo } from "../../lib/types";
import { speakTextDirect } from "../../lib/audio";

/**
 * Active Zone Banner Component
 * Floating proximity banner shown when player enters a zone
 * Displays zone info and prompts interaction
 */

interface ActiveZoneBannerProps {
  /** The active zone information */
  activeZone: ZoneInfo | null;
  /** Callback when user chooses to interact with zone */
  onInteract: (zoneId: string) => void;
}

export const ActiveZoneBanner = ({
  activeZone,
  onInteract,
}: ActiveZoneBannerProps) => {
  if (!activeZone) {
    return null;
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 transition animate-fade-in pointer-events-auto">
      <div
        className="flex flex-col gap-2 p-4 text-white bg-slate-950/90 border rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300"
        style={{ borderColor: `${activeZone.color}66` }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
            style={{
              backgroundColor: `${activeZone.color}22`,
              color: activeZone.color,
            }}
          >
            Area Detected
          </span>
          <button
            onClick={() => speakTextDirect(activeZone.speechText)}
            className="text-slate-400 hover:text-white transition"
            title="Hear Guide"
          >
            <Volume2 size={16} />
          </button>
        </div>
        <h3
          className="text-sm font-bold tracking-wide font-display"
          style={{ color: activeZone.color }}
        >
          {activeZone.title}
        </h3>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          {activeZone.description}
        </p>

        <button
          onClick={() => {
            onInteract(activeZone.id);
            speakTextDirect(activeZone.speechText);
          }}
          className="mt-1 flex items-center justify-center gap-1.5 w-full bg-white hover:bg-slate-200 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md"
        >
          <FileText size={14} />
          {activeZone.actionText} (Press E)
        </button>
      </div>
    </div>
  );
};
