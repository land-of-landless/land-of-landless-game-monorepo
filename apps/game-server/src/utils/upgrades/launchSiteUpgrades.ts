/**
 * Launch Site Upgrade Definitions
 * Complete upgrade tree for launch sites with engines, reusability, and efficiency upgrades
 */

import {
  LaunchSiteUpgradeTree,
  LaunchSiteUpgradeNode,
  EngineType,
  LaunchPhase,
} from './types';

/**
 * Launch Site Upgrade Tree
 * Tree structure organized by categories:
 * - ENGINE branch: Chemical → Ion → Nuclear → Plasma
 * - ENGINE_COUNT branch: Number of engines (1 → 2 → 3 → 4)
 * - REUSABILITY branch: Rocket recovery tech
 * - EFFICIENCY branch: Fuel and performance optimization
 * - LANDING branch: Landing system upgrades (requires reusability)
 */
export const LAUNCH_SITE_UPGRADE_TREE: LaunchSiteUpgradeTree = {
  // ==================== ENGINE TYPE BRANCH ====================
  // Chemical engine - baseline
  'engine_chemical_base': {
    id: 'engine_chemical_base',
    name: 'Chemical Engine',
    description: 'Standard chemical rocket engine. Reliable and cost-effective.',
    level: 0,
    maxLevel: 3,
    engineType: 'chemical',
    applicablePhases: ['ignition', 'ascending', 'orbit_injection'],
    rocketTypeRequired: 'any',
    requirements: [
      { type: 'lab_level', value: 1 },
    ],
    cost: {
      titanium: 500,
      energy: 200,
      credits: 1000,
    },
    duration: 3600, // 1 hour
    parentIds: [],
    childIds: ['engine_ion_base', 'engine_count_2'],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 5,
        isPercentage: true,
      },
      {
        type: 'payload_capacity',
        value: 100,
        isPercentage: false, // absolute kg
      },
    ],
  },

  // Ion engine - more efficient, +10% boost
  'engine_ion_base': {
    id: 'engine_ion_base',
    name: 'Ion Engine',
    description:
      'Advanced ion propulsion. 10% better fuel efficiency than chemical, more expensive.',
    level: 0,
    maxLevel: 3,
    engineType: 'ion',
    applicablePhases: ['ignition', 'ascending', 'orbit_injection'],
    rocketTypeRequired: 'any',
    requirements: [
      { type: 'lab_level', value: 3 },
      { type: 'upgrade_level', value: 1 }, // Chemical engine at level 1+
    ],
    cost: {
      aluminum: 800,
      titanium: 1200,
      energy: 500,
      credits: 3500,
    },
    duration: 7200, // 2 hours
    parentIds: ['engine_chemical_base'],
    childIds: ['engine_nuclear_base'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 10,
        isPercentage: true,
      },
      {
        type: 'launch_success_chance',
        value: 8,
        isPercentage: true,
      },
      {
        type: 'payload_capacity',
        value: 150,
        isPercentage: false,
      },
    ],
  },

  // Nuclear engine - high thrust
  'engine_nuclear_base': {
    id: 'engine_nuclear_base',
    name: 'Nuclear Engine',
    description:
      'Nuclear thermal propulsion. High thrust and efficiency. Requires advanced tech.',
    level: 0,
    maxLevel: 2,
    engineType: 'nuclear',
    applicablePhases: ['ignition', 'ascending', 'orbit_injection'],
    rocketTypeRequired: 'any',
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 3 }, // Advanced tech requirement
    ],
    cost: {
      titanium: 3000,
      energy: 2000,
      credits: 10000,
    },
    duration: 14400, // 4 hours
    parentIds: ['engine_ion_base'],
    childIds: ['engine_plasma_base'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 20,
        isPercentage: true,
      },
      {
        type: 'engine_thrust',
        value: 25,
        isPercentage: true,
      },
      {
        type: 'launch_success_chance',
        value: 12,
        isPercentage: true,
      },
      {
        type: 'payload_capacity',
        value: 300,
        isPercentage: false,
      },
    ],
  },

  // Plasma engine - cutting edge
  'engine_plasma_base': {
    id: 'engine_plasma_base',
    name: 'Plasma Engine',
    description:
      'Cutting-edge plasma propulsion. Highest efficiency and thrust. Very expensive.',
    level: 0,
    maxLevel: 1,
    engineType: 'plasma',
    applicablePhases: ['ignition', 'ascending', 'orbit_injection'],
    rocketTypeRequired: 'any',
    requirements: [
      { type: 'lab_level', value: 10 },
      { type: 'tech_level', value: 5 },
    ],
    cost: {
      aluminum: 2000,
      titanium: 5000,
      energy: 5000,
      credits: 25000,
    },
    duration: 28800, // 8 hours
    parentIds: ['engine_nuclear_base'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 35,
        isPercentage: true,
      },
      {
        type: 'engine_thrust',
        value: 50,
        isPercentage: true,
      },
      {
        type: 'launch_success_chance',
        value: 20,
        isPercentage: true,
      },
      {
        type: 'payload_capacity',
        value: 500,
        isPercentage: false,
      },
    ],
  },

  // ==================== ENGINE COUNT BRANCH ====================
  // Dual engines
  'engine_count_2': {
    id: 'engine_count_2',
    name: 'Dual Engine Setup',
    description: 'Install two engines for increased thrust and redundancy.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
      { type: 'upgrade_level', value: 1 }, // Chemical engine required
    ],
    cost: {
      titanium: 1000,
      aluminum: 500,
      energy: 300,
      credits: 2000,
    },
    duration: 5400, // 1.5 hours
    parentIds: ['engine_chemical_base'],
    childIds: ['engine_count_3'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 100,
        isPercentage: false, // absolute thrust units
      },
      {
        type: 'launch_success_chance',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  // Triple engines
  'engine_count_3': {
    id: 'engine_count_3',
    name: 'Triple Engine Setup',
    description: 'Three engines for heavy payload launches.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
      { type: 'upgrade_level', value: 2 }, // Chemical engine at level 2
    ],
    cost: {
      titanium: 2000,
      aluminum: 1000,
      energy: 600,
      credits: 5000,
    },
    duration: 7200, // 2 hours
    parentIds: ['engine_count_2'],
    childIds: ['engine_count_4'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 200,
        isPercentage: false,
      },
      {
        type: 'payload_capacity',
        value: 300,
        isPercentage: false,
      },
      {
        type: 'launch_success_chance',
        value: 7,
        isPercentage: true,
      },
    ],
  },

  // Quad engines
  'engine_count_4': {
    id: 'engine_count_4',
    name: 'Quad Engine Setup',
    description: 'Maximum engine configuration for ultimate launch capability.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 4000,
      aluminum: 2000,
      energy: 1200,
      credits: 12000,
    },
    duration: 10800, // 3 hours
    parentIds: ['engine_count_3'],
    childIds: [],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 400,
        isPercentage: false,
      },
      {
        type: 'payload_capacity',
        value: 600,
        isPercentage: false,
      },
      {
        type: 'launch_success_chance',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  // ==================== REUSABILITY BRANCH ====================
  // Rocket recovery tech - unlocks return and landing phases
  'reusability_basic': {
    id: 'reusability_basic',
    name: 'Rocket Recovery Technology',
    description:
      'Develop technology to recover and reuse rockets. Unlocks Return and Landing phases.',
    level: 0,
    maxLevel: 1,
    rocketTypeRequired: 'any',
    requirements: [
      { type: 'lab_level', value: 5 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 5000,
      aluminum: 2000,
      energy: 3000,
      credits: 15000,
    },
    duration: 18000, // 5 hours
    parentIds: ['engine_chemical_base'],
    childIds: ['reusability_enhanced', 'landing_system_basic'],
    bonuses: [
      {
        type: 'reusability_chance',
        value: 50,
        isPercentage: true, // 50% chance to recover rocket
      },
    ],
  },

  // Enhanced recovery
  'reusability_enhanced': {
    id: 'reusability_enhanced',
    name: 'Enhanced Recovery System',
    description: 'Improve rocket recovery rate and landing precision.',
    level: 0,
    maxLevel: 2,
    rocketTypeRequired: 'reusable',
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'upgrade_level', value: 1 }, // Basic recovery required
    ],
    cost: {
      titanium: 3000,
      aluminum: 1500,
      energy: 2000,
      credits: 8000,
    },
    duration: 14400, // 4 hours
    parentIds: ['reusability_basic'],
    childIds: ['reusability_advanced'],
    bonuses: [
      {
        type: 'reusability_chance',
        value: 25,
        isPercentage: true, // Increases recovery rate by 25%
      },
    ],
  },

  // Advanced recovery
  'reusability_advanced': {
    id: 'reusability_advanced',
    name: 'Advanced Recovery System',
    description: 'Near-perfect rocket recovery with minimal damage.',
    level: 0,
    maxLevel: 1,
    rocketTypeRequired: 'reusable',
    requirements: [
      { type: 'lab_level', value: 10 },
      { type: 'tech_level', value: 4 },
    ],
    cost: {
      titanium: 5000,
      energy: 4000,
      credits: 20000,
    },
    duration: 21600, // 6 hours
    parentIds: ['reusability_enhanced'],
    childIds: [],
    bonuses: [
      {
        type: 'reusability_chance',
        value: 40,
        isPercentage: true, // +40% more recovery
      },
    ],
  },

  // ==================== LANDING BRANCH ====================
  // Landing system - requires reusability
  'landing_system_basic': {
    id: 'landing_system_basic',
    name: 'Landing System',
    description: 'Automated landing system for controlled descent and touchdown.',
    level: 0,
    maxLevel: 1,
    applicablePhases: ['return', 'landing'],
    rocketTypeRequired: 'reusable',
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'upgrade_level', value: 1 }, // Reusability basic required
    ],
    cost: {
      titanium: 2000,
      aluminum: 1000,
      energy: 1500,
      credits: 7000,
    },
    duration: 10800, // 3 hours
    parentIds: ['reusability_basic'],
    childIds: ['landing_system_precision'],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  // Precision landing
  'landing_system_precision': {
    id: 'landing_system_precision',
    name: 'Precision Landing System',
    description: 'Advanced autopilot for accurate landings with minimal fuel waste.',
    level: 0,
    maxLevel: 2,
    applicablePhases: ['return', 'landing'],
    rocketTypeRequired: 'reusable',
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'upgrade_level', value: 1 }, // Basic landing required
    ],
    cost: {
      titanium: 1500,
      aluminum: 800,
      energy: 1000,
      credits: 5000,
    },
    duration: 7200, // 2 hours
    parentIds: ['landing_system_basic'],
    childIds: ['landing_system_autonomous'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 15,
        isPercentage: true, // Landing phase efficiency
      },
      {
        type: 'launch_success_chance',
        value: 8,
        isPercentage: true,
      },
    ],
  },

  // Autonomous landing
  'landing_system_autonomous': {
    id: 'landing_system_autonomous',
    name: 'Autonomous Landing System',
    description: 'Full autonomous landing with AI-assisted navigation.',
    level: 0,
    maxLevel: 1,
    applicablePhases: ['return', 'landing'],
    rocketTypeRequired: 'reusable',
    requirements: [
      { type: 'lab_level', value: 10 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 3000,
      energy: 2000,
      credits: 12000,
    },
    duration: 14400, // 4 hours
    parentIds: ['landing_system_precision'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 25,
        isPercentage: true,
      },
      {
        type: 'reusability_chance',
        value: 15,
        isPercentage: true,
      },
      {
        type: 'launch_success_chance',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  // ==================== EFFICIENCY BRANCH ====================
  // Fuel efficiency
  'efficiency_fuel': {
    id: 'efficiency_fuel',
    name: 'Fuel Optimization',
    description: 'Optimize fuel systems for better efficiency.',
    level: 0,
    maxLevel: 3,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 800,
      energy: 400,
      credits: 2000,
    },
    duration: 5400, // 1.5 hours
    parentIds: ['engine_chemical_base'],
    childIds: ['efficiency_payload'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 5,
        isPercentage: true,
      },
      {
        type: 'phase_duration',
        value: 3,
        isPercentage: true, // Reduces phase duration by 3%
      },
    ],
  },

  // Payload optimization
  'efficiency_payload': {
    id: 'efficiency_payload',
    name: 'Payload Optimization',
    description: 'Structural improvements to carry heavier payloads.',
    level: 0,
    maxLevel: 3,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      aluminum: 600,
      titanium: 1200,
      energy: 500,
      credits: 3000,
    },
    duration: 7200, // 2 hours
    parentIds: ['efficiency_fuel'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 200,
        isPercentage: false,
      },
      {
        type: 'launch_success_chance',
        value: 3,
        isPercentage: true,
      },
    ],
  },

  // Launch success rate
  'efficiency_reliability': {
    id: 'efficiency_reliability',
    name: 'Reliability Systems',
    description: 'Redundant systems and quality control for safer launches.',
    level: 0,
    maxLevel: 3,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 2000,
      energy: 1000,
      credits: 5000,
    },
    duration: 9000, // 2.5 hours
    parentIds: ['engine_chemical_base'],
    childIds: [],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 15,
        isPercentage: true,
      },
    ],
  },
};

/**
 * Launch Site Upgrade Tree organization by category
 * Helps UI display upgrades in logical groups
 */
export const LAUNCH_SITE_UPGRADE_CATEGORIES = {
  engines: [
    'engine_chemical_base',
    'engine_ion_base',
    'engine_nuclear_base',
    'engine_plasma_base',
  ],
  engineCount: [
    'engine_count_2',
    'engine_count_3',
    'engine_count_4',
  ],
  reusability: [
    'reusability_basic',
    'reusability_enhanced',
    'reusability_advanced',
  ],
  landing: [
    'landing_system_basic',
    'landing_system_precision',
    'landing_system_autonomous',
  ],
  efficiency: [
    'efficiency_fuel',
    'efficiency_payload',
    'efficiency_reliability',
  ],
};
