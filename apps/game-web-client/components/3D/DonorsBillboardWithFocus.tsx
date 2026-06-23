import React, { useRef } from "react";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import { useBillboardProximity } from "@/hooks/useProximity";
import { useBillboardStore } from "@/stores/billboardStore";
import { DonorsBillboard } from "./DonorsBillboard";

interface DonorsBillboardWithFocusProps {
  position?: [number, number, number];
  triggerDistance?: number;
}

/**
 * Enhanced DonorsBillboard with Rapier physics-based proximity detection.
 * Uses a box sensor collider to detect when player character enters/exits vicinity.
 * Sensor triggers on actual physical collision - camera panning has NO effect.
 */
export const DonorsBillboardWithFocus: React.FC<
  DonorsBillboardWithFocusProps
> = ({ position = [0, 5, -30], triggerDistance = 8 }) => {
  const sensorRef = useRef<RapierRigidBody>(null);

  const { isInProximity, setIsInProximity } = useBillboardProximity({
    billboardPosition: position,
    triggerDistance,
    focusDistance: 7,
  });
  const setIsInBillboardVicinity = useBillboardStore(
    (state) => state.setIsInBillboardVicinity,
  );

  // Update store when proximity changes
  React.useEffect(() => {
    setIsInBillboardVicinity(isInProximity);
  }, [isInProximity, setIsInBillboardVicinity]);

  return (
    <>
      {/* Render the billboard */}
      <DonorsBillboard position={position} />

      {/* Box sensor collider for proximity detection - sized and positioned in front of billboard */}
      <RigidBody
        ref={sensorRef}
        position={[position[0], 2, position[2] + 2]}
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[4, 2.5, 1.5]}
          sensor
          onIntersectionEnter={() => {
            console.log("Billboard: Player entered proximity");
            setIsInProximity(true);
          }}
          onIntersectionExit={() => {
            console.log("Billboard: Player exited proximity");
            setIsInProximity(false);
          }}
        />
      </RigidBody>

      {/* Visual indicator when in proximity */}
      {isInProximity && (
        <group position={position}>
          {/* Subtle glow ring to show focus area */}
          <mesh position={[0, 0, 0.1]}>
            <ringGeometry args={[8.5, 9, 32]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
          </mesh>
        </group>
      )}
    </>
  );
};
