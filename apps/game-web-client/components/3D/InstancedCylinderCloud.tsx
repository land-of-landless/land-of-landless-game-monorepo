import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const InstancedCylinderCloud = ({
  items,
  baseArgs,
  color,
  roughness = 0.2,
  metalness = 0.8,
  emissive,
  emissiveIntensity,
}: {
  items: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }>;
  baseArgs: [number, number, number, number?];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    items.forEach((item, index) => {
      tempObject.position.set(...item.position);
      const rotation = item.rotation ?? [0, 0, 0];
      const scale = item.scale ?? [1, 1, 1];
      tempObject.rotation.set(...rotation);
      tempObject.scale.set(...scale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [items, tempObject]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]}>
      <cylinderGeometry args={baseArgs} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </instancedMesh>
  );
};
