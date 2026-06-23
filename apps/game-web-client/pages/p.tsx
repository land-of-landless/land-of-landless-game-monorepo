import { Canvas } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { useFullscreen } from "rooks";

// 3D Scene
import { Scene3D } from "../components/3D/Scene3D";

// UI Layout
import { GameLayout } from "../components/UI/GameLayout";

// Hooks
import { useGameScene } from "../hooks/useGameScene";

// Config & Utils
import { CANVAS_CONFIG } from "../config/gameConfig";
import { playPageFontClassName } from "../lib/fonts";

export default function Play() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen({ target: containerRef });

  const {
    activeZone,
    openZoneId,
    setOpenZoneId,
    vaultCooldown,
    setVaultCooldown,
    vaultClaimed,
    setVaultClaimed,
    proposedOrdinance,
    voteStage,
    setVoteStage,
    yesVotes,
    noVotes,
    voteLogs,
    archivePage,
    setArchivePage,
    archivePages,
    coins,
    handleEnterZone,
    handleExitZone,
    handleProposeOrdinance,
    addCoins,
    heal,
    setScoreMultiplier,
  } = useGameScene();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute("tabindex", "0");
      containerRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`play-page ${playPageFontClassName} w-full h-screen bg-[#07080b] overflow-hidden select-none`}
    >
      <Canvas
        camera={CANVAS_CONFIG.camera as any}
        gl={CANVAS_CONFIG.gl}
        dpr={CANVAS_CONFIG.dpr}
      >
        <Scene3D
          disableControl={!!openZoneId}
          onEnterZone={handleEnterZone}
          onExitZone={handleExitZone}
        />
      </Canvas>

      <GameLayout
        activeZone={activeZone}
        openZoneId={openZoneId}
        vaultCooldown={vaultCooldown}
        vaultClaimed={vaultClaimed}
        coins={coins}
        voteStage={voteStage}
        proposedOrdinance={proposedOrdinance}
        yesVotes={yesVotes}
        noVotes={noVotes}
        voteLogs={voteLogs}
        archivePage={archivePage}
        isFullscreenAvailable={isFullscreenAvailable}
        isFullscreenEnabled={isFullscreenEnabled}
        onInteractZone={(zoneId) => {
          setOpenZoneId(zoneId);
        }}
        onSetOpenZoneId={setOpenZoneId}
        onAddCoins={addCoins}
        onSetScoreMultiplier={setScoreMultiplier}
        onHeal={heal}
        onSetVaultCooldown={setVaultCooldown}
        onSetVaultClaimed={setVaultClaimed}
        onProposeOrdinance={handleProposeOrdinance}
        onSetVoteStage={setVoteStage}
        onSetArchivePage={setArchivePage}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
