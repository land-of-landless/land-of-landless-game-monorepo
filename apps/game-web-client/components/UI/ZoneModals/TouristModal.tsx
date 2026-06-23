import { HelpCircle, Volume2, Sparkles } from "lucide-react";
import { ZoneInfo } from "../../../lib/types";
import { speakTextDirect } from "../../../lib/audio";

/**
 * Tourist Modal Component
 * Welcome/info dashboard for the tourist area
 */

interface TouristModalProps {
  /** The active zone information */
  activeZone: ZoneInfo | null;
  /** Callback to close the modal */
  onClose: () => void;
}

export const TouristModal = ({ activeZone, onClose }: TouristModalProps) => {
  return (
    <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-display font-bold text-cyan-400 text-sm flex items-center gap-2">
          <HelpCircle size={16} />
          TOURIST NARRATION CENTER
        </h3>
        <button
          onClick={() => speakTextDirect(activeZone?.speechText || "")}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded p-1.5 transition"
          title="Replay guide voice"
        >
          <Volume2 size={14} />
        </button>
      </div>
      <div className="p-5 space-y-4 text-xs leading-relaxed font-sans text-slate-200">
        <div className="flex justify-center my-1.5 animate-pulse">
          <div className="w-16 h-16 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-400">
            <Sparkles size={32} />
          </div>
        </div>
        <p>
          Welcome, traveler. You are currently standing in the majestic{" "}
          <strong className="text-white">Entrance Hall</strong>. From here, you
          have permission to access all public and executive sections of the
          Land of Landless central government:
        </p>
        <div className="space-y-2.5 font-mono text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <strong className="text-blue-400 w-28 inline-block">
              Mayor&apos;s Office:
            </strong>{" "}
            Enact executive decrees
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <strong className="text-yellow-400 w-28 inline-block">
              Treasury Vault:
            </strong>{" "}
            Claim citizen tax allocations
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <strong className="text-green-400 w-28 inline-block">
              Council Hall:
            </strong>{" "}
            Vote on proposed legislative acts
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <strong className="text-purple-400 w-28 inline-block">
              Archives Desk:
            </strong>{" "}
            Read historic developer journals
          </p>
        </div>
        <p className="text-slate-400 text-[11px] text-center border-t border-slate-900 pt-3">
          Please explore the rooms to activate their dashboard terminals.
        </p>
      </div>
      <div className="bg-slate-900/40 p-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={onClose}
          className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Exit Terminal
        </button>
      </div>
    </div>
  );
};
