import { FileText } from "lucide-react";
import { speakTextDirect } from "../../../lib/audio";

/**
 * Mayor Modal Component
 * Parchment-style decree interface for signing executive orders
 */

interface MayorModalProps {
  /** Callback to add coins to player wallet */
  onAddCoins: (amount: number) => void;
  /** Callback to set score multiplier */
  onSetScoreMultiplier: (multiplier: number) => void;
  /** Callback to heal player */
  onHeal: (amount: number) => void;
  /** Callback to close the modal */
  onClose: () => void;
}

export const MayorModal = ({
  onAddCoins,
  onSetScoreMultiplier,
  onHeal,
  onClose,
}: MayorModalProps) => {
  return (
    <div className="w-full max-w-lg bg-[#f9f5eb] border-[6px] border-[#3e2723] rounded-lg shadow-2xl p-6 text-slate-800 relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
      <div className="text-center space-y-1 border-b border-[#3e2723]/30 pb-4">
        <h4 className="font-serif italic text-xs tracking-widest text-[#5d4037] uppercase">
          State of Landless
        </h4>
        <h3 className="font-serif font-black text-2xl tracking-wider text-[#3e2723] flex items-center justify-center gap-2">
          <FileText size={24} className="text-[#3e2723]" />
          OFFICIAL EXECUTIVE DECREE
        </h3>
        <p className="text-[10px] italic font-serif text-[#795548]">
          By Decree of the appointed Deputy Mayor
        </p>
      </div>

      <div className="my-6 space-y-4">
        <p className="text-xs italic font-serif text-slate-700 text-center">
          Select one administrative decree to stamp into law. Enacting a decree
          immediately adjusts national parameters and awards specific status
          rewards.
        </p>

        <div className="space-y-3 mt-4">
          {/* Decree Option 1 */}
          <button
            onClick={() => {
              onAddCoins(100);
              speakTextDirect(
                "Decree signed! Glitch tax enacted. 100 gold coins added.",
              );
              onClose();
            }}
            className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
          >
            <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
              <span>I. LEVY PHYSICS GLITCH TAX</span>
              <span className="text-[10px] font-mono bg-amber-800 text-white px-2 py-0.5 rounded">
                REWARD: +100 Coins 🪙
              </span>
            </h4>
            <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
              &quot;Citizens reporting strange gravity fluctuations, floating
              capsules, or infinite bounce distortions shall pay a levy to the
              high-court. Fills treasury immediately.&quot;
            </p>
          </button>

          {/* Decree Option 2 */}
          <button
            onClick={() => {
              onSetScoreMultiplier(2.5);
              speakTextDirect(
                "Decree signed! Monorepo standardization act enacted. Multiplier increased to 2.5.",
              );
              onClose();
            }}
            className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
          >
            <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
              <span>II. STANDARDIZE MONOREPO FORMATTING</span>
              <span className="text-[10px] font-mono bg-blue-800 text-white px-2 py-0.5 rounded">
                REWARD: x2.5 Multiplier 📈
              </span>
            </h4>
            <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
              &quot;Enforces a strict linting code formatting index and
              centralized environment variables across all provinces. Boosts
              computed score outputs significantly.&quot;
            </p>
          </button>

          {/* Decree Option 3 */}
          <button
            onClick={() => {
              onHeal(100);
              speakTextDirect(
                "Decree signed! Public health mandate active. Character fully healed.",
              );
              onClose();
            }}
            className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
          >
            <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
              <span>III. CONSOLIDATED CITIZEN HEALTH ACT</span>
              <span className="text-[10px] font-mono bg-emerald-800 text-white px-2 py-0.5 rounded">
                REWARD: FULL HEAL (100 HP) 💖
              </span>
            </h4>
            <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
              &quot;Mandates that the Ministry of Alchemy dispense immediate,
              high-grade potion reserves to fully restore any damaged player
              statistics.&quot;
            </p>
          </button>
        </div>
      </div>

      <div className="border-t border-[#3e2723]/30 pt-4 flex justify-between items-center">
        <span className="text-[10px] font-serif italic text-slate-500">
          Signed: Deputy Mayor Antigravity
        </span>
        <button
          onClick={onClose}
          className="bg-[#3e2723] hover:bg-[#5d4037] text-[#f9f5eb] font-serif font-bold px-4 py-1.5 rounded text-xs transition cursor-pointer"
        >
          Cancel Decree
        </button>
      </div>
    </div>
  );
};
