import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";

/**
 * A glowing physics ball that bounces and rolls with configurable friction
 */
export const FrictionBall = ({
  position,
  color = "#ff4488",
  radius = 0.45,
  friction = 0.6,
  restitution = 0.55,
  emissiveIntensity = 0.8,
}: {
  position: [number, number, number];
  color?: string;
  radius?: number;
  friction?: number;
  restitution?: number;
  emissiveIntensity?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle emissive pulse
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        emissiveIntensity + Math.sin(clock.getElapsedTime() * 3) * 0.25;
    }
  });

  return (
    <RigidBody
      position={position}
      colliders="ball"
      friction={friction}
      restitution={restitution}
      linearDamping={0.15}
      angularDamping={0.1}
    >
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>
    </RigidBody>
  );
};
