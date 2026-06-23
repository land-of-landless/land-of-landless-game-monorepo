import { RigidBody } from "@react-three/rapier";

/**
 * 3D Assets for Tourist Info Desk
 */
export const TouristDeskAssets = ({
  position,
}: {
  position: [number, number, number];
}) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Sleek Curved Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 1, 1.2]} />
          <meshStandardMaterial
            color="#1c2030"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Glass glowing screen floating above desk */}
        <mesh position={[0, 1.3, 0.2]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.05]} />
          <meshStandardMaterial
            color="#00f0ff"
            transparent
            opacity={0.6}
            emissive="#00f0ff"
            emissiveIntensity={1.5}
          />
        </mesh>
        {/* Plant Pot decoration */}
        <mesh position={[1.5, 0.5, 0]}>
          <cylinderGeometry args={[0.25, 0.15, 0.6, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Minimalist plant leaf */}
        <mesh position={[1.5, 1.0, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#00aa55" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
};
