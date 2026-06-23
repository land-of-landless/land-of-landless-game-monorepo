/**
 * Light Configuration
 * All lighting setup for the 3D scene
 */

// ============================================================================
// LIGHT DEFINITIONS
// ============================================================================

export interface LightConfig {
  type: "ambient" | "directional" | "hemisphere" | "point";
  intensity: number;
  color?: string;
  position?: [number, number, number];
  distance?: number;
  groundColor?: string;
}

/**
 * Architectural Ambient & Direct Lights
 * Creates the primary neoclassical lighting aesthetic
 */
export const AMBIENT_LIGHT_CONFIG: LightConfig = {
  type: "ambient",
  intensity: 4.8,
  color: "#f2f8ff",
};

export const HEMISPHERE_LIGHT_CONFIG: LightConfig = {
  type: "hemisphere",
  intensity: 3.4,
  color: "#eaf4ff",
  groundColor: "#253040",
};

/**
 * Directional Lights
 * Main fill lights for the scene
 */
export const DIRECTIONAL_LIGHTS_CONFIG: LightConfig[] = [
  {
    type: "directional",
    position: [20, 25, 15],
    intensity: 2.2,
  },
  {
    type: "directional",
    position: [-20, 18, -10],
    intensity: 1.6,
    color: "#dbeeff",
  },
];

/**
 * Point Lights
 * Subdued overhead blue lights for neoclassical aesthetic
 */
export const POINT_LIGHTS_CONFIG: LightConfig[] = [
  {
    type: "point",
    position: [0, 8, 0],
    intensity: 4.5,
    distance: 45,
    color: "#59b8ff",
  },
  {
    type: "point",
    position: [-20, 6, -15],
    intensity: 3.5,
    distance: 35,
    color: "#79a3ff",
  },
  {
    type: "point",
    position: [20, 6, -15],
    intensity: 3.5,
    distance: 35,
    color: "#ffd980",
  },
  {
    type: "point",
    position: [-20, 6, 15],
    intensity: 3.5,
    distance: 35,
    color: "#7df0bf",
  },
  {
    type: "point",
    position: [20, 6, 15],
    intensity: 3.5,
    distance: 35,
    color: "#ba9cff",
  },
];

/**
 * All lights in order of rendering
 * Total: 8 lights (1 ambient + 1 hemisphere + 2 directional + 4 point)
 */
export const ALL_LIGHTS_CONFIG: LightConfig[] = [
  AMBIENT_LIGHT_CONFIG,
  HEMISPHERE_LIGHT_CONFIG,
  ...DIRECTIONAL_LIGHTS_CONFIG,
  ...POINT_LIGHTS_CONFIG,
];
