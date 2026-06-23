import { RigidBody } from "@react-three/rapier";

/**
 * 3D Assets for Mayor's Office
 */
export const MayorsOfficeAssets = ({
  position,
}: {
  position: [number, number, number];
}) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Huge Mahogany Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[4.5, 1, 2]} />
          <meshStandardMaterial
            color="#40170b"
            roughness={0.2}
            metalness={0.2}
          />
        </mesh>
        {/* Desk top gold accents */}
        <mesh position={[0, 1.01, 0]}>
          <boxGeometry args={[4.3, 0.02, 1.8]} />
          <meshStandardMaterial
            color="#ffd700"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* High-back executive chair */}
        <mesh castShadow position={[0, 0.9, -1.5]}>
          <boxGeometry args={[1.2, 1.8, 0.3]} />
          <meshStandardMaterial color="#701515" roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 0.5, -1.2]}>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>

        {/* Diplomatic Office Flag Pole */}
        <mesh castShadow position={[-2, 2.5, -1.5]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} />
        </mesh>
        {/* Hanging City Crest banner */}
        <mesh position={[-2, 3.8, -1.0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 1.8, 0.02]} />
          <meshStandardMaterial color="#1a3b70" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
};
