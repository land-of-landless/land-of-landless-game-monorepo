import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import { InstancedBoxCloud } from "../InstancedBoxCloud";

/**
 * 3D Assets for Town Archives
 */
export const TownArchivesAssets = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const leftBooks = useMemo(
    () =>
      [...Array(5)].flatMap((_, floorIdx) =>
        [...Array(6)].map((_, bookIdx) => {
          const bookHeight = 0.5 + Math.sin(bookIdx) * 0.15;
          const xOffset = -0.9 + bookIdx * 0.36;
          const yOffset = 0.7 + floorIdx * 1.15;
          return {
            position: [xOffset, yOffset, 0.3] as [number, number, number],
            scale: [1, bookHeight, 1] as [number, number, number],
          };
        }),
      ),
    [],
  );

  const rightBooks = useMemo(
    () =>
      [...Array(5)].flatMap((_, floorIdx) =>
        [...Array(6)].map((_, bookIdx) => {
          const bookHeight = 0.5 + Math.cos(bookIdx) * 0.1;
          const xOffset = -0.9 + bookIdx * 0.36;
          const yOffset = 0.7 + floorIdx * 1.15;
          return {
            position: [xOffset, yOffset, 0.3] as [number, number, number],
            scale: [1, bookHeight, 1] as [number, number, number],
          };
        }),
      ),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Bookcase Left */}
        <group position={[-3.5, 0, -4]}>
          <mesh castShadow position={[0, 3, 0]}>
            <boxGeometry args={[2.5, 6, 0.8]} />
            <meshStandardMaterial color="#2d1e15" roughness={0.5} />
          </mesh>
          {/* Instanced books */}
          <InstancedBoxCloud
            items={leftBooks}
            baseSize={[0.26, 1, 0.45]}
            color="#8f5a37"
          />
        </group>

        {/* Bookcase Right */}
        <group position={[3.5, 0, -4]}>
          <mesh castShadow position={[0, 3, 0]}>
            <boxGeometry args={[2.5, 6, 0.8]} />
            <meshStandardMaterial color="#2d1e15" roughness={0.5} />
          </mesh>
          {/* Instanced books */}
          <InstancedBoxCloud
            items={rightBooks}
            baseSize={[0.26, 1, 0.45]}
            color="#6b3f2a"
          />
        </group>

        {/* Solid Reading Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, -0.5]}>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#3d281a" roughness={0.3} />
        </mesh>
        {/* Open lore book mesh */}
        <group position={[0, 1.05, -0.5]} rotation={[-0.1, 0, 0]}>
          <mesh castShadow position={[-0.32, 0, 0]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.6]} />
            <meshStandardMaterial color="#faf9f6" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0.32, 0, 0]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.6]} />
            <meshStandardMaterial color="#faf9f6" roughness={0.9} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
};
