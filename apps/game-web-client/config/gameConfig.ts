/**
 * Game Configuration
 * Central hub for all game constants, settings, and configuration
 */

// ============================================================================
// CANVAS & RENDERING
// ============================================================================

export const CANVAS_CONFIG = {
  /** Camera initial position [x, y, z] */
  camera: {
    position: [0, 8, 26] as [number, number, number],
    fov: 42,
  },
  /** Device pixel ratio for rendering */
  dpr: 1.4,
  /** Canvas GL properties */
  gl: {
    antialias: true,
  },
} as const;

// ============================================================================
// PHYSICS & WORLD
// ============================================================================

export const PHYSICS_CONFIG = {
  /** Physics world gravity [x, y, z] */
  gravity: [0, -9.81, 0] as [number, number, number],
  /** Physics time step configuration */
  timeStep: "vary" as const,
  /** Enable physics debug visualization */
  debug: true,
} as const;

// ============================================================================
// CHARACTER CONTROLLER (ECCTRL)
// ============================================================================

export const CHARACTER_CONFIG = {
  /** Spawn position [x, y, z] */
  spawnPosition: [0, 2, 34] as [number, number, number],
  /** Capsule geometry radius and height */
  capsule: {
    radius: 0.4,
    height: 0.7,
  },
  /** Capsule material appearance */
  material: {
    color: "#ffd700",
    roughness: 0.1,
    metalness: 0.9,
  },
  /** Movement settings */
  movement: {
    maxVelLimit: 7,
    jumpVel: 5.5,
    turnVelMultiplier: 1,
    turnSpeed: 100,
    mode: "CameraBasedMovement" as const,
  },
  /** Camera settings */
  camera: {
    initialDistance: -8,
    maxDistance: -16,
    minDistance: -0.1,
    followMultiplier: 1000,
    lerpMultiplier: 1000,
  },
} as const;

// ============================================================================
// SKY & ATMOSPHERE
// ============================================================================

export const SKY_CONFIG = {
  sunPosition: [120, 30, 80] as [number, number, number],
  turbidity: 8,
  rayleigh: 2,
  mieCoefficient: 0.005,
} as const;

// ============================================================================
// INTERACTIVE ZONES
// ============================================================================

export interface ZoneConfig {
  id: string;
  position: [number, number, number];
  radius: number;
  color: string;
  title: string;
  description: string;
  actionText: string;
  speechText: string;
}

export const ZONES_CONFIG: Record<string, ZoneConfig> = {
  tourist: {
    id: "tourist",
    position: [0, 0.5, 21],
    radius: 2.8,
    color: "#00f0ff",
    title: "Info Desk",
    description:
      "The welcoming desk of Landless City Hall. Interact to hear the guidance narration or view details about the chambers.",
    actionText: "Consult Guide",
    speechText:
      "Welcome to the Grand City Hall of Land of Landless. Walk around to visit the Treasury, the Council Chamber, the Archives, or the Mayor's Office. Be sure to check out the central Monument Plaza!",
  },
  mayor: {
    id: "mayor",
    position: [-24, 0.5, -18],
    radius: 3.0,
    color: "#0066ff",
    title: "Mayor's Study",
    description:
      "The high-office of executive power. Interact to draft legislation and sign national decrees to alter your character statistics.",
    actionText: "Sign Executive Decree",
    speechText:
      "Enter the Mayor's private study. You can review city documents and issue executive decrees to alter local parameters.",
  },
  treasury: {
    id: "treasury",
    position: [24, 0.5, -18],
    radius: 3.0,
    color: "#ffaa00",
    title: "Treasury Vault",
    description:
      "Secure vault harboring the tax funds of the state. Interact to withdraw your daily citizen gold stipend.",
    actionText: "Collect Peasant Tax",
    speechText:
      "Access the high-security bank vault. Under the Landless Charter, you are entitled to claim daily tax revenues collected from the peasants.",
  },
  council: {
    id: "council",
    position: [-24, 0.5, 12],
    radius: 3.2,
    color: "#00ff66",
    title: "Council Chambers",
    description:
      "The assembly house of regional representation. Propose standard bills at the microphone podium and see live council voting.",
    actionText: "Address the Council",
    speechText:
      "Propose a city ordinance at the grand speaker podium and watch the council representatives vote in real time.",
  },
  archives: {
    id: "archives",
    position: [24, 0.5, 12],
    radius: 3.0,
    color: "#aa00ff",
    title: "Town Archives",
    description:
      "Historic repository of ancient manuscripts. Interact to read through the multi-chapter mythology of the developers.",
    actionText: "Read Ancient Books",
    speechText:
      "Peruse the historical records and ancient lore of the Land of Landless.",
  },
} as const;

// ============================================================================
// ARCHITECTURE ASSET POSITIONS
// ============================================================================

export const ARCHITECTURE_POSITIONS = {
  touristDesk: [0, 0, 24] as [number, number, number],
  mayorsOffice: [-24, 0, -22] as [number, number, number],
  treasuryVault: [24, 0, -22] as [number, number, number],
  councilChamber: [-24, 0, 18] as [number, number, number],
  townArchives: [24, 0, 18] as [number, number, number],
  statueMonument: [0, 0, 0] as [number, number, number],
  donorsBillboard: [0, 5, -40] as [number, number, number],
} as const;

export const DONORS_BILLBOARD_CONFIG = {
  position: ARCHITECTURE_POSITIONS.donorsBillboard,
  triggerDistance: 8,
} as const;

// ============================================================================
// FRICTION BALLS
// ============================================================================

export interface FrictionBallConfig {
  id: string;
  position: [number, number, number];
  color: string;
  friction: number;
  restitution: number;
  radius?: number;
  emissiveIntensity?: number;
}

export const FRICTION_BALLS_CONFIG: FrictionBallConfig[] = [
  {
    id: "ball-1",
    position: [8, 2, 30],
    color: "#ff4488",
    friction: 0.6,
    restitution: 0.55,
  },
  {
    id: "ball-2",
    position: [-6, 2, 28],
    color: "#00f0ff",
    friction: 0.4,
    restitution: 0.7,
    emissiveIntensity: 1.0,
  },
  {
    id: "ball-3",
    position: [5, 2, -10],
    color: "#ffcc00",
    radius: 0.6,
    friction: 0.8,
    restitution: 0.35,
    emissiveIntensity: 0.6,
  },
  {
    id: "ball-4",
    position: [-30, 2, 5],
    color: "#aa00ff",
    friction: 0.3,
    restitution: 0.8,
    emissiveIntensity: 0.9,
  },
  {
    id: "ball-5",
    position: [30, 2, 5],
    color: "#00ff88",
    radius: 0.35,
    friction: 0.9,
    restitution: 0.2,
    emissiveIntensity: 0.7,
  },
] as const;

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

export const PERFORMANCE_MONITOR_CONFIG = {
  /** Target FPS bounds [min, max] */
  bounds: [45, 60] as [number, number],
} as const;

// ============================================================================
// PERF DEBUG MONITOR
// ============================================================================

export const PERF_MONITOR_CONFIG = {
  position: "bottom-left" as const,
} as const;
