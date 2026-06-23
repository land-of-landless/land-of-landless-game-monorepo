import { Vote, RotateCcw } from "lucide-react";

/**
 * Council Modal Component
 * Legislative chamber for voting on city ordinances
 */

interface CouncilModalProps {
  /** Current voting stage: idle (selecting), voting (in progress), finished (completed) */
  voteStage: "idle" | "voting" | "finished";
  /** The proposed ordinance name */
  proposedOrdinance: string | null;
  /** Current count of yes votes */
  yesVotes: number;
  /** Current count of no votes */
  noVotes: number;
  /** Vote debate logs */
  voteLogs: string[];
  /** Callback to propose an ordinance */
  onProposeOrdinance: (name: string) => void;
  /** Callback to reset vote stage to idle */
  onResetVotes: () => void;
  /** Callback to close the modal */
  onClose: () => void;
}

export const CouncilModal = ({
  voteStage,
  proposedOrdinance,
  yesVotes,
  noVotes,
  voteLogs,
  onProposeOrdinance,
  onResetVotes,
  onClose,
}: CouncilModalProps) => {
  return (
    <div className="w-full max-w-lg bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl text-white p-5 flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
        <h3 className="font-display font-bold text-emerald-400 text-sm flex items-center gap-2">
          <Vote size={18} />
          LEGISLATIVE CHAMBER DIAS
        </h3>
        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
          Session Active
        </span>
      </div>

      {voteStage === "idle" ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed font-sans text-center italic">
            Approach the speaker&apos;s podium. Select one city proposal to
            introduce on the floor. The representative councilors will debate
            and cast real-time votes.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() =>
                onProposeOrdinance("The Public Double Jump Subsidy Act")
              }
              className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
            >
              <h4 className="font-bold text-xs text-white">
                1. Double Jump Subsidy Act
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Funds public high-frequency jump thrusters. Upgrades standard
                player capsule jump heights.
              </p>
            </button>
            <button
              onClick={() =>
                onProposeOrdinance("The Anti-Friction Regulation")
              }
              className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
            >
              <h4 className="font-bold text-xs text-white">
                2. Anti-Friction Regulation
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Reduces overall platform friction ratios. Forces extreme
                slipperiness across obstacle ramps.
              </p>
            </button>
            <button
              onClick={() =>
                onProposeOrdinance("The Developer Beverage Mandate")
              }
              className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
            >
              <h4 className="font-bold text-xs text-white">
                3. Developer Beverage Mandate
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Allocates direct funds to provide caffeinated beverages to
                working programmers.
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block text-center">
              Active Bill:
            </span>
            <h4 className="text-center font-bold text-sm text-white px-4">
              &quot;{proposedOrdinance}&quot;
            </h4>

            {/* Progress vote bars */}
            <div className="space-y-2.5 bg-slate-900 p-4 rounded-xl border border-slate-850">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-green-400 font-bold">YES VOTES:</span>
                  <span className="text-white">{yesVotes}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{
                      width: `${(yesVotes / (yesVotes + noVotes || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-red-400 font-bold">NO VOTES:</span>
                  <span className="text-white">{noVotes}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{
                      width: `${(noVotes / (yesVotes + noVotes || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Debating logs */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 h-32 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
            {voteLogs.map((log, idx) => (
              <p
                key={idx}
                className={
                  idx === voteLogs.length - 1 ? "text-emerald-300 font-bold" : ""
                }
              >
                {log}
              </p>
            ))}
          </div>

          {voteStage === "finished" && (
            <button
              onClick={onResetVotes}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw size={12} />
              Submit Another Bill
            </button>
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-slate-900 pt-3 mt-4">
        <button
          onClick={() => {
            onClose();
            onResetVotes();
          }}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
        >
          Exit Chamber
        </button>
      </div>
    </div>
  );
};
