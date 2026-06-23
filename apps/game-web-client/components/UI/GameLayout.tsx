import { ReactNode } from "react";
import { ZoneInfo } from "../../lib/types";
import { ARCHIVE_PAGES } from "../../config/archiveData";
import { GameUI } from "./GameUI";
import { SpeechUI } from "./SpeechUI";
import { ControlsHint } from "./ControlsHint";
import { ActiveZoneBanner } from "./ActiveZoneBanner";
import { TouristModal } from "./ZoneModals/TouristModal";
import { MayorModal } from "./ZoneModals/MayorModal";
import { TreasuryModal } from "./ZoneModals/TreasuryModal";
import { CouncilModal } from "./ZoneModals/CouncilModal";
import { ArchivesModal } from "./ZoneModals/ArchivesModal";

/**
 * Game Layout Component
 * Main UI container that composes all game overlays and modals
 */

interface GameLayoutProps {
  /** The currently active zone (when player is close to an interactive area) */
  activeZone: ZoneInfo | null;
  /** The currently open zone ID (when modal is displayed) */
  openZoneId: string | null;
  /** Current vault cooldown in seconds */
  vaultCooldown: number;
  /** Whether vault claim was just completed */
  vaultClaimed: boolean;
  /** Current player coin balance */
  coins: number;
  /** Current voting stage */
  voteStage: "idle" | "voting" | "finished";
  /** The proposed ordinance name */
  proposedOrdinance: string | null;
  /** Current yes vote count */
  yesVotes: number;
  /** Current no vote count */
  noVotes: number;
  /** Vote debate logs */
  voteLogs: string[];
  /** Current archive page index */
  archivePage: number;
  /** Fullscreen availability */
  isFullscreenAvailable: boolean;
  /** Fullscreen enabled state */
  isFullscreenEnabled: boolean;
  /** Callback when player interacts with zone */
  onInteractZone: (zoneId: string) => void;
  /** Callback to set open zone ID */
  onSetOpenZoneId: (id: string | null) => void;
  /** Callback to add coins */
  onAddCoins: (amount: number) => void;
  /** Callback to set score multiplier */
  onSetScoreMultiplier: (multiplier: number) => void;
  /** Callback to heal player */
  onHeal: (amount: number) => void;
  /** Callback to set vault cooldown */
  onSetVaultCooldown: (seconds: number) => void;
  /** Callback to set vault claimed flag */
  onSetVaultClaimed: (claimed: boolean) => void;
  /** Callback to propose ordinance */
  onProposeOrdinance: (name: string) => void;
  /** Callback to set vote stage */
  onSetVoteStage: (stage: "idle" | "voting" | "finished") => void;
  /** Callback to set archive page */
  onSetArchivePage: (index: number) => void;
  /** Callback to toggle fullscreen */
  onToggleFullscreen: () => void;
  /** Additional children to render */
  children?: ReactNode;
}

export const GameLayout = ({
  activeZone,
  openZoneId,
  vaultCooldown,
  vaultClaimed,
  coins,
  voteStage,
  proposedOrdinance,
  yesVotes,
  noVotes,
  voteLogs,
  archivePage,
  isFullscreenAvailable,
  isFullscreenEnabled,
  onInteractZone,
  onSetOpenZoneId,
  onAddCoins,
  onSetScoreMultiplier,
  onHeal,
  onSetVaultCooldown,
  onSetVaultClaimed,
  onProposeOrdinance,
  onSetVoteStage,
  onSetArchivePage,
  onToggleFullscreen,
  children,
}: GameLayoutProps) => {
  return (
    <>
      {/* Keyboard controls hint overlay */}
      <ControlsHint />

      {/* Stats UI panel (top-right) */}
      <GameUI
        isFullscreenEnabled={isFullscreenEnabled}
        toggleFullscreen={onToggleFullscreen}
        isFullscreenAvailable={isFullscreenAvailable}
      />

      {/* TTS UI Generator Panel (speech controls) */}
      <SpeechUI />

      {/* Interactive Zone Floating Banner (bottom-center) */}
      {activeZone && !openZoneId && (
        <ActiveZoneBanner activeZone={activeZone} onInteract={onInteractZone} />
      )}

      {/* Zone Modals (center screen) */}
      {openZoneId && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
          {/* Tourist Guide Modal */}
          {openZoneId === "tourist" && (
            <TouristModal
              activeZone={activeZone}
              onClose={() => onSetOpenZoneId(null)}
            />
          )}

          {/* Mayor's Office Decree Modal */}
          {openZoneId === "mayor" && (
            <MayorModal
              onAddCoins={onAddCoins}
              onSetScoreMultiplier={onSetScoreMultiplier}
              onHeal={onHeal}
              onClose={() => onSetOpenZoneId(null)}
            />
          )}

          {/* Treasury Vault Modal */}
          {openZoneId === "treasury" && (
            <TreasuryModal
              vaultCooldown={vaultCooldown}
              vaultClaimed={vaultClaimed}
              coins={coins}
              onAddCoins={onAddCoins}
              onSetVaultCooldown={onSetVaultCooldown}
              onSetVaultClaimed={onSetVaultClaimed}
              onClose={() => onSetOpenZoneId(null)}
            />
          )}

          {/* Council Chambers Voting Modal */}
          {openZoneId === "council" && (
            <CouncilModal
              voteStage={voteStage}
              proposedOrdinance={proposedOrdinance}
              yesVotes={yesVotes}
              noVotes={noVotes}
              voteLogs={voteLogs}
              onProposeOrdinance={onProposeOrdinance}
              onResetVotes={() => onSetVoteStage("idle")}
              onClose={() => onSetOpenZoneId(null)}
            />
          )}

          {/* Archives Lore Book Modal */}
          {openZoneId === "archives" && (
            <ArchivesModal
              archivePage={archivePage}
              archivePages={ARCHIVE_PAGES}
              onPreviousPage={() =>
                onSetArchivePage(Math.max(0, archivePage - 1))
              }
              onNextPage={() =>
                onSetArchivePage(
                  Math.min(ARCHIVE_PAGES.length - 1, archivePage + 1),
                )
              }
              onClose={() => {
                onSetOpenZoneId(null);
                onSetArchivePage(0);
              }}
            />
          )}
        </div>
      )}

      {/* Additional children */}
      {children}
    </>
  );
};
