import { Coins, Check } from "lucide-react";
import { speakTextDirect } from "../../../lib/audio";

/**
 * Treasury Modal Component
 * Vault terminal UI for claiming tax allocations
 */

interface TreasuryModalProps {
  /** Current vault cooldown in seconds */
  vaultCooldown: number;
  /** Whether vault claim was just completed */
  vaultClaimed: boolean;
  /** Current player coin balance */
  coins: number;
  /** Callback to add coins */
  onAddCoins: (amount: number) => void;
  /** Callback to set vault cooldown */
  onSetVaultCooldown: (seconds: number) => void;
  /** Callback to set vault claimed flag */
  onSetVaultClaimed: (claimed: boolean) => void;
  /** Callback to close the modal */
  onClose: () => void;
}

export const TreasuryModal = ({
  vaultCooldown,
  vaultClaimed,
  coins,
  onAddCoins,
  onSetVaultCooldown,
  onSetVaultClaimed,
  onClose,
}: TreasuryModalProps) => {
  return (
    <div className="w-full max-w-sm bg-slate-950 border border-yellow-500/50 rounded-2xl shadow-2xl text-white p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-display font-bold text-yellow-400 text-xs flex items-center gap-1.5 tracking-wider">
          <Coins size={16} className="text-yellow-400" />
          TREASURY VAULT TERMINAL
        </h3>
        <span className="font-mono text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full uppercase animate-pulse">
          Ready
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-2.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Vault Secure State:</span>
          <span className="text-green-400 font-bold">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Total peasant tax:</span>
          <span className="text-yellow-400 font-bold">450 Gold 🪙</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Claim Allocation:</span>
          <span className="text-white">+50 Coins per request</span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-2 text-[10px]">
          <span className="text-slate-400">Your Current Wallet:</span>
          <span className="text-cyan-400">{coins} Coins</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {vaultCooldown > 0 ? (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center font-mono text-[11px] text-yellow-500">
            🔒 VAULT DOORS SECURED. COOLDOWN IN PROGRESS ({vaultCooldown}s)
          </div>
        ) : (
          <button
            onClick={() => {
              onAddCoins(50);
              onSetVaultCooldown(25);
              onSetVaultClaimed(true);
              speakTextDirect(
                "Transaction complete. 50 coins successfully withdrawn. Vault closing.",
              );
            }}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Coins size={14} />
            CLAIM TAX ALLOCATION (+50 Coins)
          </button>
        )}

        {vaultClaimed && (
          <p className="text-[10px] text-green-400 text-center font-mono animate-fade-in flex items-center justify-center gap-1">
            <Check size={12} /> Claim complete! Check top-right stats wallet.
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-900 pt-3">
        <button
          onClick={onClose}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-700 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
        >
          Close Vault
        </button>
      </div>
    </div>
  );
};
