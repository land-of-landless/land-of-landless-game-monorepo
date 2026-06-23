import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Beautiful rotating glowing crystal Statue Placeholder with Spotlight & Particles
 */
export const StatuePlaceholder = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const crystalOuterRef = useRef<THREE.Mesh>(null);
  const crystalInnerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Rotate and hover outer hologram crystal
    if (crystalOuterRef.current) {
      crystalOuterRef.current.rotation.y = elapsed * 0.6;
      crystalOuterRef.current.rotation.x = elapsed * 0.3;
      crystalOuterRef.current.position.y = 2.8 + Math.sin(elapsed * 2) * 0.15;
    }

    // Spin inner hologram counter-clockwise and faster
    if (crystalInnerRef.current) {
      crystalInnerRef.current.rotation.y = -elapsed * 1.2;
      crystalInnerRef.current.rotation.z = elapsed * 0.6;
      crystalInnerRef.current.position.y = 2.8 + Math.sin(elapsed * 2) * 0.15;
    }

    // Orbit particles around the statue
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.4;
      particlesRef.current.children.forEach((child, idx) => {
        const timeOffset = elapsed * 1.5 + idx * 0.8;
        child.position.y = Math.sin(timeOffset) * 0.6;
      });
    }
  });

  return (
    <group position={position}>
      {/* 1. Grand obsidian/marble pedestal base */}
      <RigidBody type="fixed" friction={0.8}>
        {/* Tier 1 - Bottom Steps */}
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[3.2, 3.4, 0.4, 32]} />
          <meshStandardMaterial
            color="#111115"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Tier 2 - Middle Section */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
          <meshStandardMaterial
            color="#0b0b0e"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Tier 3 - Top Columns Stand */}
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <cylinderGeometry args={[1.7, 1.8, 0.6, 32]} />
          <meshStandardMaterial
            color="#1a1a24"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Golden circular accent trims on the pedestal */}
        <mesh position={[0, 1.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.65, 1.7, 32]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
        </mesh>
      </RigidBody>

      {/* 2. Holographic Spinning Statue Placeholder */}
      {/* Outer crystalline energy cage */}
      <mesh ref={crystalOuterRef} castShadow position={[0, 2.8, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#00f0ff"
          transparent
          opacity={0.35}
          roughness={0}
          metalness={1}
          emissive="#00b0ff"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Inner high-frequency spinning core */}
      <mesh ref={crystalInnerRef} position={[0, 2.8, 0]}>
        <octahedronGeometry args={[0.45]} />
        <meshStandardMaterial
          color="#ff00a0"
          transparent
          opacity={0.7}
          wireframe
          emissive="#ff00a0"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Spotlight beaming down onto the pedestal from the sky */}
      <spotLight
        position={[0, 12, 0]}
        target-position={[0, 1, 0]}
        intensity={8}
        penumbra={0.4}
        color="#00f0ff"
      />

      {/* 3. Orbiting holographic micro-particles */}
      <group ref={particlesRef} position={[0, 2.8, 0]}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 1.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00f0ff" : "#ff00a0"} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
