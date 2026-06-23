import { RigidBody } from "@react-three/rapier";

/**
 * Renders neoclassical structural layout: grand columns, glass borders, carpets
 */
export const CityHallArchitecture = () => {
  return (
    <group>
      {/* 1. Grand Floor (obsidian tiles) */}
      <RigidBody type="fixed" friction={0.9} position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial
            color="#08090c"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </RigidBody>

      {/* Decorative Red Carpet paths leading to Statue Pedestal */}
      <mesh
        receiveShadow
        position={[0, -0.49, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[6, 80]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>
      <mesh
        receiveShadow
        position={[0, -0.49, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>
      {/* Carpet center ring around pedestal */}
      <mesh
        receiveShadow
        position={[0, -0.485, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0, 4.5, 32]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>

      {/* 2. Outer Guard Walls (Glass & Neon Trimmed Steel pillars) */}
      <RigidBody type="fixed" friction={0.6}>
        {/* Back Wall */}
        <mesh castShadow receiveShadow position={[0, 4, -48]}>
          <boxGeometry args={[96, 8, 0.8]} />
          <meshStandardMaterial
            color="#10131a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Front Wall with archways */}
        <mesh castShadow receiveShadow position={[0, 4, 48]}>
          <boxGeometry args={[96, 8, 0.8]} />
          <meshStandardMaterial
            color="#10131a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Left Wall */}
        <mesh castShadow receiveShadow position={[-48, 4, 0]}>
          <boxGeometry args={[0.8, 8, 96]} />
          <meshStandardMaterial
            color="#10131a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        {/* Right Wall */}
        <mesh castShadow receiveShadow position={[48, 4, 0]}>
          <boxGeometry args={[0.8, 8, 96]} />
          <meshStandardMaterial
            color="#10131a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Interior Dividing Half-Walls to separate rooms */}
        <mesh position={[-25, 4, 0]}>
          <boxGeometry args={[12, 8, 0.5]} />
          <meshStandardMaterial color="#131620" roughness={0.5} />
        </mesh>
        <mesh position={[25, 4, 0]}>
          <boxGeometry args={[12, 8, 0.5]} />
          <meshStandardMaterial color="#131620" roughness={0.5} />
        </mesh>
      </RigidBody>
    </group>
  );
};
