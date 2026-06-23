import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Pulsing neon ring and cylinder beam for interactive zones
 */
export const InteractiveZoneVisual = ({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Pulse the floor ring
    if (ringRef.current) {
      const scale = 1 + Math.sin(elapsed * 4) * 0.06;
      ringRef.current.scale.set(scale, scale, 1);
      if (ringRef.current.material) {
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.25 + Math.sin(elapsed * 4) * 0.08;
      }
    }

    // Slowly rotate and wobble the wireframe beam
    if (beamRef.current) {
      beamRef.current.rotation.y = elapsed * 0.4;
      if (beamRef.current.material) {
        (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.04 + Math.sin(elapsed * 2) * 0.01;
      }
    }
  });

  return (
    <group>
      {/* Floor glowing ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <ringGeometry args={[radius - 0.15, radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor solid center indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0, radius - 0.15, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Holographic vertical cylinder beam */}
      <mesh ref={beamRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 5, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
    </group>
  );
};
