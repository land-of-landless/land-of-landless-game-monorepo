/**
 * Energy Generator Upgrade Definitions
 * Upgrade tree for energy generators with power output, generator types, efficiency, and storage
 */

import {
  UpgradeNode,
} from './types';

/**
 * Energy Generator Type
 */
export type GeneratorType =
  | 'solar'
  | 'wind'
  | 'geothermal'
  | 'nuclear'
  | 'fusion';

/**
 * Energy Generator Upgrade Tree
 * Tree structure organized by categories:
 * - POWER_OUTPUT branch: Increase base power generation
 * - GENERATOR_TYPE branch: Solar → Wind → Geothermal → Nuclear → Fusion
 * - BATTERY_STORAGE branch: Store more energy
 * - EFFICIENCY branch: Lose less energy to waste
 * - DISTRIBUTION branch: Reach more facilities
 * - STABILITY branch: Prevent blackouts and fluctuations
 * - RECOVERY branch: Recover wasted energy
 * - SMART_GRID branch: Intelligent power management
 */
export const ENERGY_GENERATOR_UPGRADE_TREE: Record<string, UpgradeNode> = {
  // ==================== POWER OUTPUT BRANCH ====================
  'power_output_level1': {
    id: 'power_output_level1',
    name: 'Power Amplification I',
    description: 'Increase base power output by 15%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 1 },
    ],
    cost: {
      titanium: 200,
      aluminum: 100,
      energy: 200,
      credits: 600,
    },
    duration: 3600, // 1 hour
    parentIds: [],
    childIds: ['power_output_level2'],
    bonuses: [
      {
        type: 'engine_thrust', // Reuse for power output
        value: 15,
        isPercentage: true,
      },
    ],
  },

  'power_output_level2': {
    id: 'power_output_level2',
    name: 'Power Amplification II',
    description: 'Increase power output by 20% more.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 400,
      aluminum: 300,
      energy: 400,
      credits: 1500,
    },
    duration: 7200, // 2 hours
    parentIds: ['power_output_level1'],
    childIds: ['power_output_level3'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  'power_output_level3': {
    id: 'power_output_level3',
    name: 'Power Amplification III',
    description: 'Increase power output by 25% more - industrial power levels.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 800,
      aluminum: 600,
      energy: 800,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['power_output_level2'],
    childIds: ['power_output_level4'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 25,
        isPercentage: true,
      },
    ],
  },

  'power_output_level4': {
    id: 'power_output_level4',
    name: 'Unlimited Power',
    description: 'Massive power output increase of 30% - unlimited energy generation.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 9 },
      { type: 'tech_level', value: 4 },
    ],
    cost: {
      titanium: 1500,
      aluminum: 1000,
      energy: 1500,
      credits: 7000,
    },
    duration: 14400, // 4 hours
    parentIds: ['power_output_level3'],
    childIds: [],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 30,
        isPercentage: true,
      },
    ],
  },

  // ==================== GENERATOR TYPE BRANCH ====================
  'generator_solar': {
    id: 'generator_solar',
    name: 'Solar Power Grid',
    description: 'Harness the power of the sun - baseline renewable energy.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 1 },
    ],
    cost: {
      titanium: 300,
      aluminum: 200,
      energy: 200,
      credits: 800,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['generator_wind'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 100,
        isPercentage: false, // Absolute power units
      },
    ],
  },

  'generator_wind': {
    id: 'generator_wind',
    name: 'Wind Turbine Farm',
    description: 'Harness wind energy - better in certain locations.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 600,
      aluminum: 400,
      energy: 500,
      credits: 2000,
    },
    duration: 7200, // 2 hours
    parentIds: ['generator_solar'],
    childIds: ['generator_geothermal'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 150,
        isPercentage: false,
      },
    ],
  },

  'generator_geothermal': {
    id: 'generator_geothermal',
    name: 'Geothermal Power Station',
    description: 'Tap into planetary heat - consistent reliable power.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1000,
      aluminum: 600,
      energy: 900,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['generator_wind'],
    childIds: ['generator_nuclear'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 250,
        isPercentage: false,
      },
    ],
  },

  'generator_nuclear': {
    id: 'generator_nuclear',
    name: 'Nuclear Fission Reactor',
    description: 'Harness nuclear fission - massive power output.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 2000,
      aluminum: 1200,
      energy: 2000,
      credits: 7000,
    },
    duration: 14400, // 4 hours
    parentIds: ['generator_geothermal'],
    childIds: ['generator_fusion'],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 500,
        isPercentage: false,
      },
    ],
  },

  'generator_fusion': {
    id: 'generator_fusion',
    name: 'Fusion Reactor',
    description: 'Unlimited clean energy from fusion - the ultimate power source.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 10 },
      { type: 'tech_level', value: 5 },
    ],
    cost: {
      titanium: 4000,
      aluminum: 2000,
      energy: 4000,
      credits: 15000,
    },
    duration: 21600, // 6 hours
    parentIds: ['generator_nuclear'],
    childIds: [],
    bonuses: [
      {
        type: 'engine_thrust',
        value: 1000,
        isPercentage: false,
      },
    ],
  },

  // ==================== BATTERY STORAGE BRANCH ====================
  'battery_storage_level1': {
    id: 'battery_storage_level1',
    name: 'Battery Pack I',
    description: 'Store 50% more energy - power for later use.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      titanium: 300,
      aluminum: 200,
      energy: 300,
      credits: 1000,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['battery_storage_level2'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 50,
        isPercentage: true,
      },
    ],
  },

  'battery_storage_level2': {
    id: 'battery_storage_level2',
    name: 'Battery Pack II',
    description: 'Store 100% more energy - massive energy reserves.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      titanium: 600,
      aluminum: 400,
      energy: 600,
      credits: 2500,
    },
    duration: 7200, // 2 hours
    parentIds: ['battery_storage_level1'],
    childIds: ['battery_storage_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 100,
        isPercentage: true,
      },
    ],
  },

  'battery_storage_level3': {
    id: 'battery_storage_level3',
    name: 'Super Battery Array',
    description: 'Store 150% more energy - infinite energy on demand.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1200,
      aluminum: 800,
      energy: 1200,
      credits: 5000,
    },
    duration: 10800, // 3 hours
    parentIds: ['battery_storage_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 150,
        isPercentage: true,
      },
    ],
  },

  // ==================== DISTRIBUTION NETWORK BRANCH ====================
  'distribution_level1': {
    id: 'distribution_level1',
    name: 'Power Grid I',
    description: 'Connect to nearby facilities - serve 10% more buildings.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 400,
      aluminum: 300,
      energy: 400,
      credits: 1500,
    },
    duration: 7200, // 2 hours
    parentIds: [],
    childIds: ['distribution_level2'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'distribution_level2': {
    id: 'distribution_level2',
    name: 'Power Grid II',
    description: 'Expand distribution network - serve 20% more buildings.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 800,
      aluminum: 600,
      energy: 800,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['distribution_level1'],
    childIds: ['distribution_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  'distribution_level3': {
    id: 'distribution_level3',
    name: 'Continental Power Grid',
    description: 'Global distribution network - serve all buildings worldwide.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 1600,
      aluminum: 1200,
      energy: 1600,
      credits: 7000,
    },
    duration: 14400, // 4 hours
    parentIds: ['distribution_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 30,
        isPercentage: true,
      },
    ],
  },

  // ==================== EFFICIENCY BRANCH ====================
  'efficiency_transmission_level1': {
    id: 'efficiency_transmission_level1',
    name: 'Transmission Optimization I',
    description: 'Reduce energy loss by 5% during transmission.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      titanium: 200,
      aluminum: 150,
      energy: 300,
      credits: 800,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['efficiency_transmission_level2'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'efficiency_transmission_level2': {
    id: 'efficiency_transmission_level2',
    name: 'Transmission Optimization II',
    description: 'Reduce energy loss by 10% more - superconducting lines.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      titanium: 400,
      aluminum: 300,
      energy: 600,
      credits: 2000,
    },
    duration: 7200, // 2 hours
    parentIds: ['efficiency_transmission_level1'],
    childIds: ['efficiency_transmission_level3'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'efficiency_transmission_level3': {
    id: 'efficiency_transmission_level3',
    name: 'Perfect Transmission',
    description: 'Reduce energy loss by 15% more - zero-loss quantum transmission.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 800,
      aluminum: 600,
      energy: 1200,
      credits: 4500,
    },
    duration: 10800, // 3 hours
    parentIds: ['efficiency_transmission_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== STABILITY BRANCH ====================
  'stability_level1': {
    id: 'stability_level1',
    name: 'Power Stabilization I',
    description: 'Prevent power fluctuations - 10% more stable supply.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      titanium: 500,
      aluminum: 300,
      energy: 600,
      credits: 2000,
    },
    duration: 9000, // 2.5 hours
    parentIds: [],
    childIds: ['stability_level2'],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'stability_level2': {
    id: 'stability_level2',
    name: 'Power Stabilization II',
    description: 'Advanced stabilization systems - 20% more stable supply.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1000,
      aluminum: 600,
      energy: 1200,
      credits: 4000,
    },
    duration: 10800, // 3 hours
    parentIds: ['stability_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  // ==================== RECOVERY BRANCH ====================
  'recovery_system_level1': {
    id: 'recovery_system_level1',
    name: 'Energy Recovery I',
    description: 'Recover 10% of wasted energy - more efficient operations.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 600,
      aluminum: 400,
      energy: 700,
      credits: 2500,
    },
    duration: 9000, // 2.5 hours
    parentIds: [],
    childIds: ['recovery_system_level2'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'recovery_system_level2': {
    id: 'recovery_system_level2',
    name: 'Energy Recovery II',
    description: 'Recover 20% of wasted energy - capture almost all power.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1200,
      aluminum: 800,
      energy: 1400,
      credits: 5000,
    },
    duration: 14400, // 4 hours
    parentIds: ['recovery_system_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  // ==================== SMART GRID BRANCH ====================
  'smart_grid_level1': {
    id: 'smart_grid_level1',
    name: 'Smart Grid I',
    description: 'Intelligent power distribution - optimize usage by 10%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
    ],
    cost: {
      titanium: 700,
      aluminum: 500,
      energy: 900,
      credits: 3000,
    },
    duration: 10800, // 3 hours
    parentIds: [],
    childIds: ['smart_grid_level2'],
    bonuses: [
      {
        type: 'build_speed',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'smart_grid_level2': {
    id: 'smart_grid_level2',
    name: 'Smart Grid II',
    description: 'AI-powered distribution - optimize usage by 20%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 1400,
      aluminum: 1000,
      energy: 1800,
      credits: 6000,
    },
    duration: 14400, // 4 hours
    parentIds: ['smart_grid_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'build_speed',
        value: 20,
        isPercentage: true,
      },
    ],
  },
};

/**
 * Energy Generator Upgrade Tree organization by category
 */
export const ENERGY_GENERATOR_UPGRADE_CATEGORIES = {
  powerOutput: [
    'power_output_level1',
    'power_output_level2',
    'power_output_level3',
    'power_output_level4',
  ],
  generatorTypes: [
    'generator_solar',
    'generator_wind',
    'generator_geothermal',
    'generator_nuclear',
    'generator_fusion',
  ],
  batteryStorage: [
    'battery_storage_level1',
    'battery_storage_level2',
    'battery_storage_level3',
  ],
  distribution: [
    'distribution_level1',
    'distribution_level2',
    'distribution_level3',
  ],
  efficiency: [
    'efficiency_transmission_level1',
    'efficiency_transmission_level2',
    'efficiency_transmission_level3',
  ],
  stability: [
    'stability_level1',
    'stability_level2',
  ],
  recovery: [
    'recovery_system_level1',
    'recovery_system_level2',
  ],
  smartGrid: [
    'smart_grid_level1',
    'smart_grid_level2',
  ],
};
