import { Suspense } from "react";
import { Perf } from "r3f-perf";
import { PerformanceMonitor, AdaptiveEvents, Sky } from "@react-three/drei";
import {
  SKY_CONFIG,
  PERF_MONITOR_CONFIG,
  PERFORMANCE_MONITOR_CONFIG,
  ARCHITECTURE_POSITIONS,
  DONORS_BILLBOARD_CONFIG,
} from "../../config/gameConfig";

// 3D Components
import { PhysicsSetup } from "./PhysicsSetup";
import { CharacterController } from "./CharacterController";
import { ZonesContainer } from "./ZonesContainer";
import { FrictionBalls } from "./FrictionBalls";
import { StatuePlaceholder } from "./StatuePlaceholder";
import { DonorsBillboardWithFocus } from "./DonorsBillboardWithFocus";

// Architecture Components
import { CityHallArchitecture } from "./Architecture/CityHallArchitecture";
import { TouristDeskAssets } from "./Architecture/TouristDeskAssets";
import { MayorsOfficeAssets } from "./Architecture/MayorsOfficeAssets";
import { TreasuryVaultAssets } from "./Architecture/TreasuryVaultAssets";
import { CouncilChamberAssets } from "./Architecture/CouncilChamberAssets";
import { TownArchivesAssets } from "./Architecture/TownArchivesAssets";

// Types
import { ZoneInfo } from "../../lib/types";

/**
 * Scene3D Component
 * Main 3D scene wrapper that orchestrates all 3D elements:
 * - Sky and atmosphere
 * - Physics world with lighting
 * - Character controller
 * - Interactive zones
 * - Architecture assets
 * - Friction balls
 * - Billboard
 * - Performance monitoring
 */

interface Scene3DProps {
  /** Whether character controls are disabled */
  disableControl?: boolean;
  /** Callback when player enters a zone */
  onEnterZone: (zone: ZoneInfo) => void;
  /** Callback when player exits a zone */
  onExitZone: (id: string) => void;
}

export const Scene3D = ({
  disableControl = false,
  onEnterZone,
  onExitZone,
}: Scene3DProps) => {
  return (
    <Suspense fallback={null}>
      {/* Performance debug monitor */}
      <Perf position={PERF_MONITOR_CONFIG.position} />

      {/* Sky and atmosphere */}
      <Sky
        sunPosition={SKY_CONFIG.sunPosition}
        turbidity={SKY_CONFIG.turbidity}
        rayleigh={SKY_CONFIG.rayleigh}
        mieCoefficient={SKY_CONFIG.mieCoefficient}
      />

      {/* Performance monitor with adaptive rendering */}
      <PerformanceMonitor bounds={() => PERFORMANCE_MONITOR_CONFIG.bounds}>
        <AdaptiveEvents />

        {/* Physics world setup with all lighting */}
        <PhysicsSetup>
          {/* Neoclassical Floor, Dividing Walls & Columns */}
          <CityHallArchitecture />

          {/* Statue Pedestal & Glowing Spinning Holographic Crystal */}
          <StatuePlaceholder position={ARCHITECTURE_POSITIONS.statueMonument} />

          {/* Character Controller - Spawned safely in front lobby */}
          <CharacterController disableControl={disableControl} />

          {/* 5 Distinct Interactive Rooms Assets & Sensors */}

          {/* 1. Tourist Info Desk in Entrance Lobby */}
          <TouristDeskAssets position={ARCHITECTURE_POSITIONS.touristDesk} />

          {/* 2. Mayor's Office (Back-Left Wing) */}
          <MayorsOfficeAssets position={ARCHITECTURE_POSITIONS.mayorsOffice} />

          {/* 3. City Treasury Vault (Back-Right Wing) */}
          <TreasuryVaultAssets position={ARCHITECTURE_POSITIONS.treasuryVault} />

          {/* 4. Council Chambers (Front-Left Wing) */}
          <CouncilChamberAssets position={ARCHITECTURE_POSITIONS.councilChamber} />

          {/* 5. Town Archives & Library (Front-Right Wing) */}
          <TownArchivesAssets position={ARCHITECTURE_POSITIONS.townArchives} />

          {/* All interactive zones with collision sensors */}
          <ZonesContainer onEnterZone={onEnterZone} onExitZone={onExitZone} />

          {/* Friction Balls — kick them around! */}
          <FrictionBalls />

          {/* 3D Donors Billboard - Eye-catching supporter showcase with auto-focus */}
          <DonorsBillboardWithFocus
            position={DONORS_BILLBOARD_CONFIG.position}
            triggerDistance={DONORS_BILLBOARD_CONFIG.triggerDistance}
          />
        </PhysicsSetup>
      </PerformanceMonitor>
    </Suspense>
  );
};
