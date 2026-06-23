import Ecctrl from "ecctrl";
import { CHARACTER_CONFIG } from "../../config/gameConfig";

/**
 * Character Controller Component
 * Handles the player character (Ecctrl) with capsule mesh and all movement/camera settings
 */

interface CharacterControllerProps {
  /** Whether controls are disabled (e.g., when in a zone modal) */
  disableControl?: boolean;
}

export const CharacterController = ({
  disableControl = false,
}: CharacterControllerProps) => {
  return (
    <Ecctrl
      position={CHARACTER_CONFIG.spawnPosition}
      maxVelLimit={CHARACTER_CONFIG.movement.maxVelLimit}
      jumpVel={CHARACTER_CONFIG.movement.jumpVel}
      camInitDis={CHARACTER_CONFIG.camera.initialDistance}
      camMaxDis={CHARACTER_CONFIG.camera.maxDistance}
      camMinDis={CHARACTER_CONFIG.camera.minDistance}
      camFollowMult={CHARACTER_CONFIG.camera.followMultiplier}
      camLerpMult={CHARACTER_CONFIG.camera.lerpMultiplier}
      turnVelMultiplier={CHARACTER_CONFIG.movement.turnVelMultiplier}
      turnSpeed={CHARACTER_CONFIG.movement.turnSpeed}
      mode={CHARACTER_CONFIG.movement.mode}
      disableControl={disableControl}
    >
      {/* Capsule mesh for character body */}
      <mesh>
        <capsuleGeometry
          args={[
            CHARACTER_CONFIG.capsule.radius,
            CHARACTER_CONFIG.capsule.height,
          ]}
        />
        <meshStandardMaterial
          color={CHARACTER_CONFIG.material.color}
          roughness={CHARACTER_CONFIG.material.roughness}
          metalness={CHARACTER_CONFIG.material.metalness}
        />
      </mesh>
    </Ecctrl>
  );
};
