import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const InstancedBoxCloud = ({
  items,
  baseSize,
  color,
}: {
  items: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }>;
  baseSize: [number, number, number];
  color: string;
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
      <boxGeometry args={baseSize} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </instancedMesh>
  );
};
