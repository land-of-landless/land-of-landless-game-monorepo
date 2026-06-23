import { ReactNode } from "react";
import { Physics } from "@react-three/rapier";
import { Preload } from "@react-three/drei";
import {
  PHYSICS_CONFIG,
  PERFORMANCE_MONITOR_CONFIG,
} from "../../config/gameConfig";
import {
  AMBIENT_LIGHT_CONFIG,
  HEMISPHERE_LIGHT_CONFIG,
  DIRECTIONAL_LIGHTS_CONFIG,
  POINT_LIGHTS_CONFIG,
} from "../../config/lightConfig";

/**
 * Physics Setup Component
 * Configures the physics world with Rapier and renders all scene lighting
 */

interface PhysicsSetupProps {
  /** Child components to render inside physics world */
  children: ReactNode;
}

export const PhysicsSetup = ({ children }: PhysicsSetupProps) => {
  return (
    <Physics
      debug={PHYSICS_CONFIG.debug}
      timeStep={PHYSICS_CONFIG.timeStep}
      gravity={PHYSICS_CONFIG.gravity}
    >
      {/* Architectural Ambient Light */}
      <ambientLight
        intensity={AMBIENT_LIGHT_CONFIG.intensity}
        color={AMBIENT_LIGHT_CONFIG.color}
      />

      {/* Hemisphere Light */}
      <hemisphereLight
        color={HEMISPHERE_LIGHT_CONFIG.color}
        groundColor={HEMISPHERE_LIGHT_CONFIG.groundColor}
        intensity={HEMISPHERE_LIGHT_CONFIG.intensity}
      />

      {/* Directional Lights */}
      {DIRECTIONAL_LIGHTS_CONFIG.map((light, idx) => (
        <directionalLight
          key={`directional-${idx}`}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
        />
      ))}

      {/* Point Lights - Subdued overhead blue lights for neoclassical aesthetic */}
      {POINT_LIGHTS_CONFIG.map((light, idx) => (
        <pointLight
          key={`point-${idx}`}
          position={light.position}
          intensity={light.intensity}
          distance={light.distance}
          color={light.color}
        />
      ))}

      {/* Render children (character, zones, balls, architecture) */}
      {children}

      {/* Preload assets for better performance */}
      <Preload all />
    </Physics>
  );
};
