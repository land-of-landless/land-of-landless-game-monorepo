import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import { InstancedCylinderCloud } from "../InstancedCylinderCloud";

/**
 * 3D Assets for Treasury Vault
 */
export const TreasuryVaultAssets = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const coinStacks = useMemo(
    () =>
      [...Array(12)].map((_, i) => {
        const stackHeight = 1 + (i % 3) * 0.45;
        const xOffset = -2.5 + Math.floor(i / 3) * 1.5 + Math.sin(i) * 0.2;
        const zOffset = -4 - (i % 2) * 1.5;
        return {
          position: [xOffset, stackHeight / 2, zOffset] as [
            number,
            number,
            number,
          ],
          scale: [1, stackHeight, 1] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Thick steel bank walls around room */}
        <mesh castShadow position={[-4, 4, -4]}>
          <boxGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial
            color="#2d323f"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
        <mesh castShadow position={[0, 4, -8]}>
          <boxGeometry args={[8, 8, 0.8]} />
          <meshStandardMaterial
            color="#2d323f"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>

        {/* Circular vault door lock mechanism */}
        <mesh castShadow position={[0, 3.5, -3.8]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.25, 16, 48]} />
          <meshStandardMaterial
            color="#8a95a5"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Center rotating gear */}
        <mesh castShadow position={[0, 3.5, -3.7]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
          <meshStandardMaterial
            color="#ffbc00"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Treasury gold deposit terminal stand */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 1.2, 16]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
        {/* Neon gold pulsing chest model above stand */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial
            color="#ffcc00"
            roughness={0}
            metalness={1}
            emissive="#ff9900"
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* Instanced coin stacks to reduce draw calls */}
        <InstancedCylinderCloud
          items={coinStacks}
          baseArgs={[0.35, 0.35, 1, 12]}
          color="#ffd700"
          roughness={0.1}
          metalness={0.95}
          emissive="#aa7700"
          emissiveIntensity={0.2}
        />
      </RigidBody>
    </group>
  );
};
