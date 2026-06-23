import { useEffect, useRef, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface UseBillboardProximityProps {
  billboardPosition: [number, number, number];
  triggerDistance?: number;
  focusDistance?: number;
  onEnterProximity?: () => void;
  onExitProximity?: () => void;
}

/**
 * Hook to manage camera focus animation on a billboard.
 * Receives proximity state from external Rapier collision detection.
 * Handles smooth camera animation and positioning.
 *
 * Usage:
 * ```tsx
 * const { isInProximity, setIsInProximity } = useBillboardProximity({
 *   billboardPosition: [0, 5, -30],
 *   focusDistance: 7,
 * });
 *
 * // Called by Rapier collision callbacks
 * setIsInProximity(true); // Enter proximity
 * setIsInProximity(false); // Exit proximity
 * ```
 */
export const useBillboardProximity = ({
  billboardPosition,
  triggerDistance = 8,
  focusDistance = 7,
  onEnterProximity,
  onExitProximity,
}: UseBillboardProximityProps) => {
  const { camera, scene } = useThree();
  const [isInProximity, setIsInProximity] = useState(false);
  const focusStartTimeRef = useRef<number>(0);
  const startCameraRef = useRef<THREE.Vector3>();
  const targetCameraRef = useRef<THREE.Vector3>();
  const isAnimatingRef = useRef(false);
  const hasNotifiedEnterRef = useRef(false);
  const previousProximityRef = useRef(false);

  // Get player position from camera (Ecctrl controls camera to follow character)
  const getPlayerPosition = useCallback(() => {
    const playerPos = new THREE.Vector3();
    playerPos.copy(camera.position);
    playerPos.y = 2; // Approximate character height
    return playerPos;
  }, [camera]);

  // Calculate target camera position facing the billboard
  const calculateBillboardFocusPosition = useCallback(() => {
    const billboard = new THREE.Vector3(...billboardPosition);
    const playerPos = getPlayerPosition();

    // Position camera perpendicular to billboard, at focus distance
    const direction = new THREE.Vector3();
    direction.subVectors(playerPos, billboard);
    direction.normalize();

    // Position camera at focus distance from billboard
    const targetPos = new THREE.Vector3();
    targetPos.addVectors(billboard, direction.multiplyScalar(focusDistance));
    targetPos.y = billboardPosition[1] + 0.5; // Slightly above billboard center for better view

    return targetPos;
  }, [billboardPosition, focusDistance, getPlayerPosition]);

  // Handle proximity state changes
  useEffect(() => {
    // Detect state changes only (not every render)
    if (isInProximity !== previousProximityRef.current) {
      previousProximityRef.current = isInProximity;

      if (isInProximity) {
        // Entering proximity
        isAnimatingRef.current = true;
        focusStartTimeRef.current = Date.now();
        startCameraRef.current = camera.position.clone();
        targetCameraRef.current = calculateBillboardFocusPosition();

        if (!hasNotifiedEnterRef.current) {
          onEnterProximity?.();
          hasNotifiedEnterRef.current = true;
        }
      } else {
        // Exiting proximity
        isAnimatingRef.current = false;
        hasNotifiedEnterRef.current = false;
        onExitProximity?.();
      }
    }
  }, [
    isInProximity,
    calculateBillboardFocusPosition,
    onEnterProximity,
    onExitProximity,
  ]);

  // Camera animation and control loop
  useFrame(() => {
    // Continuously update camera position during focus
    if (isInProximity) {
      if (
        isAnimatingRef.current &&
        startCameraRef.current &&
        targetCameraRef.current
      ) {
        // Animate into focus position
        const now = Date.now();
        const elapsed = now - focusStartTimeRef.current;
        const animationDuration = 1000; // 1 second
        const progress = Math.min(elapsed / animationDuration, 1);

        // Ease-out-cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(
          startCameraRef.current,
          targetCameraRef.current,
          easeProgress,
        );

        if (progress >= 1) {
          isAnimatingRef.current = false;
        }
      } else if (!isAnimatingRef.current && targetCameraRef.current) {
        // Already in focus - keep camera position fixed while allowing player to move
        const currentTargetPos = calculateBillboardFocusPosition();
        camera.position.copy(currentTargetPos);
      }

      // Always look at the billboard while in focus
      const billboard = new THREE.Vector3(...billboardPosition);
      billboard.y = billboardPosition[1] + 0.5;
      camera.lookAt(billboard);
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      startCameraRef.current = undefined;
      targetCameraRef.current = undefined;
    };
  }, []);

  return {
    isInProximity,
    setIsInProximity,
  };
};
