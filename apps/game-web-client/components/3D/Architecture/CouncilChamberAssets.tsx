import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import { InstancedBoxCloud } from "../InstancedBoxCloud";

/**
 * 3D Assets for Council Chamber
 */
export const CouncilChamberAssets = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const chairSeatInstances = useMemo(
    () =>
      [...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return {
          position: [x, 0.4, z] as [number, number, number],
          rotation: [0, -angle - Math.PI / 2, 0] as [number, number, number],
        };
      }),
    [],
  );

  const chairBackInstances = useMemo(
    () =>
      [...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const offsetX = Math.sin(-angle - Math.PI / 2) * 0.3;
        const offsetZ = Math.cos(-angle - Math.PI / 2) * 0.3;
        return {
          position: [x + offsetX, 1.2, z + offsetZ] as [number, number, number],
          rotation: [0, -angle - Math.PI / 2, 0] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Grand Circular Assembly Table */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[3.2, 3.2, 0.15, 32]} />
          <meshStandardMaterial color="#543015" roughness={0.3} />
        </mesh>
        {/* Table metal leg ring */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[3.0, 3.0, 0.45, 32, 1, true]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>

        {/* Instanced chair seats/backs to reduce draw calls */}
        <InstancedBoxCloud
          items={chairSeatInstances}
          baseSize={[0.8, 0.8, 0.8]}
          color="#1a2e40"
        />
        <InstancedBoxCloud
          items={chairBackInstances}
          baseSize={[0.8, 0.9, 0.15]}
          color="#0e1b27"
        />

        {/* Speaker Podium with microphone */}
        <mesh castShadow receiveShadow position={[0, 0.7, -5.5]}>
          <boxGeometry args={[1.2, 1.4, 0.8]} />
          <meshStandardMaterial color="#301c0c" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 1.6, -5.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color="#222" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.9, -5.5]}>
          <sphereGeometry args={[0.06]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </RigidBody>
    </group>
  );
};
