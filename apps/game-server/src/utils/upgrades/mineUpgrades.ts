/**
 * Mine Upgrade Definitions
 * Upgrade tree for mines with extraction rate, ore quality, efficiency, and rare element detection
 */

import {
  UpgradeNode,
} from './types';

/**
 * Mine Upgrade Tree
 * Tree structure organized by categories:
 * - EXTRACTION branch: Ore extraction rate improvements
 * - ORE_QUALITY branch: Quality and purity improvements
 * - EFFICIENCY branch: Power and resource optimization
 * - CAPACITY branch: Storage and conveyor improvements
 * - DEEP_MINING branch: Access deeper ore deposits
 * - AUTOMATION branch: Automated extraction systems
 * - RARE_ELEMENTS branch: Detection and extraction of rare materials
 */
export const MINE_UPGRADE_TREE: Record<string, UpgradeNode> = {
  // ==================== EXTRACTION RATE BRANCH ====================
  'extraction_speed_level1': {
    id: 'extraction_speed_level1',
    name: 'Extraction Optimization I',
    description: 'Improve mining efficiency by 10% - extract ore faster.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 1 },
    ],
    cost: {
      iron: 300,
      titanium: 100,
      energy: 150,
      credits: 500,
    },
    duration: 3600, // 1 hour
    parentIds: [],
    childIds: ['extraction_speed_level2'],
    bonuses: [
      {
        type: 'build_speed', // Reuse for extraction speed
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'extraction_speed_level2': {
    id: 'extraction_speed_level2',
    name: 'Extraction Optimization II',
    description: 'Improve mining efficiency by 15% more.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      iron: 500,
      titanium: 300,
      aluminum: 200,
      energy: 300,
      credits: 1500,
    },
    duration: 7200, // 2 hours
    parentIds: ['extraction_speed_level1'],
    childIds: ['extraction_speed_level3'],
    bonuses: [
      {
        type: 'build_speed',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  'extraction_speed_level3': {
    id: 'extraction_speed_level3',
    name: 'Extraction Optimization III',
    description: 'Improve mining efficiency by 20% more - advanced techniques.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 800,
      titanium: 600,
      aluminum: 400,
      energy: 600,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['extraction_speed_level2'],
    childIds: ['extraction_speed_level4'],
    bonuses: [
      {
        type: 'build_speed',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  'extraction_speed_level4': {
    id: 'extraction_speed_level4',
    name: 'Industrial Extraction',
    description: 'Massive extraction speed boost of 25% - industrial-grade equipment.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      iron: 1200,
      titanium: 1000,
      aluminum: 600,
      energy: 1000,
      credits: 6000,
    },
    duration: 14400, // 4 hours
    parentIds: ['extraction_speed_level3'],
    childIds: [],
    bonuses: [
      {
        type: 'build_speed',
        value: 25,
        isPercentage: true,
      },
    ],
  },

  // ==================== ORE QUALITY BRANCH ====================
  'ore_quality_level1': {
    id: 'ore_quality_level1',
    name: 'Quality Refinement I',
    description: 'Improve ore quality by 5% - better processing yields.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      iron: 200,
      titanium: 300,
      energy: 200,
      credits: 700,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['ore_quality_level2'],
    bonuses: [
      {
        type: 'payload_capacity', // Reuse for quality/yield
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'ore_quality_level2': {
    id: 'ore_quality_level2',
    name: 'Quality Refinement II',
    description: 'Improve ore quality by 10% more - premium ore extraction.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      iron: 400,
      titanium: 600,
      aluminum: 300,
      energy: 400,
      credits: 2000,
    },
    duration: 7200, // 2 hours
    parentIds: ['ore_quality_level1'],
    childIds: ['ore_quality_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'ore_quality_level3': {
    id: 'ore_quality_level3',
    name: 'Pure Ore Processing',
    description: 'Achieve 15% higher ore quality - near-pure material extraction.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 700,
      titanium: 1000,
      aluminum: 500,
      energy: 700,
      credits: 4000,
    },
    duration: 10800, // 3 hours
    parentIds: ['ore_quality_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== DEEP MINING BRANCH ====================
  'deep_mining_level1': {
    id: 'deep_mining_level1',
    name: 'Deep Mining I',
    description: 'Access deeper ore deposits - 30% more ore per cycle.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      iron: 600,
      titanium: 800,
      aluminum: 400,
      energy: 500,
      credits: 2500,
    },
    duration: 9000, // 2.5 hours
    parentIds: [],
    childIds: ['deep_mining_level2'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 30,
        isPercentage: false, // Absolute ore amount
      },
    ],
  },

  'deep_mining_level2': {
    id: 'deep_mining_level2',
    name: 'Deep Mining II',
    description: 'Access even deeper veins - 50% more ore per cycle.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 1000,
      titanium: 1400,
      aluminum: 700,
      energy: 900,
      credits: 5000,
    },
    duration: 14400, // 4 hours
    parentIds: ['deep_mining_level1'],
    childIds: ['deep_mining_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 50,
        isPercentage: false,
      },
    ],
  },

  'deep_mining_level3': {
    id: 'deep_mining_level3',
    name: 'Extreme Depth Mining',
    description: 'Access ancient ore deposits - 80% more ore per cycle.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 9 },
      { type: 'tech_level', value: 4 },
    ],
    cost: {
      iron: 1800,
      titanium: 2500,
      aluminum: 1200,
      energy: 1600,
      credits: 10000,
    },
    duration: 21600, // 6 hours
    parentIds: ['deep_mining_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 80,
        isPercentage: false,
      },
    ],
  },

  // ==================== STORAGE & CAPACITY BRANCH ====================
  'storage_capacity_level1': {
    id: 'storage_capacity_level1',
    name: 'Storage Expansion I',
    description: 'Expand ore storage by 50% - hold more ore before processing.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      iron: 400,
      titanium: 200,
      energy: 150,
      credits: 800,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['storage_capacity_level2'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 50,
        isPercentage: true,
      },
    ],
  },

  'storage_capacity_level2': {
    id: 'storage_capacity_level2',
    name: 'Storage Expansion II',
    description: 'Expand ore storage by 100% more - massive holding capacity.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      iron: 800,
      titanium: 400,
      aluminum: 300,
      energy: 300,
      credits: 2000,
    },
    duration: 7200, // 2 hours
    parentIds: ['storage_capacity_level1'],
    childIds: ['storage_capacity_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 100,
        isPercentage: true,
      },
    ],
  },

  'storage_capacity_level3': {
    id: 'storage_capacity_level3',
    name: 'Mega Storage Facility',
    description: 'Expand ore storage by 150% more - infinite capacity mining.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 1600,
      titanium: 800,
      aluminum: 600,
      energy: 600,
      credits: 4500,
    },
    duration: 10800, // 3 hours
    parentIds: ['storage_capacity_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 150,
        isPercentage: true,
      },
    ],
  },

  // ==================== AUTOMATION BRANCH ====================
  'automation_level1': {
    id: 'automation_level1',
    name: 'Autonomous Mining I',
    description: 'Introduce automated mining drills - 10% passive ore generation.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      iron: 700,
      titanium: 900,
      aluminum: 500,
      energy: 800,
      credits: 3500,
    },
    duration: 9000, // 2.5 hours
    parentIds: [],
    childIds: ['automation_level2'],
    bonuses: [
      {
        type: 'build_speed',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'automation_level2': {
    id: 'automation_level2',
    name: 'Full Autonomous Mining',
    description: 'Complete automated mining network - 20% passive ore generation.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      iron: 1400,
      titanium: 1800,
      aluminum: 1000,
      energy: 1600,
      credits: 7000,
    },
    duration: 14400, // 4 hours
    parentIds: ['automation_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'build_speed',
        value: 20,
        isPercentage: true,
      },
    ],
  },

  // ==================== EFFICIENCY BRANCH ====================
  'efficiency_power_level1': {
    id: 'efficiency_power_level1',
    name: 'Power Optimization I',
    description: 'Reduce power consumption by 5% - more efficient mining.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      iron: 300,
      titanium: 200,
      energy: 300,
      credits: 1000,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['efficiency_power_level2'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'efficiency_power_level2': {
    id: 'efficiency_power_level2',
    name: 'Power Optimization II',
    description: 'Reduce power consumption by 10% more.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      iron: 600,
      titanium: 400,
      aluminum: 300,
      energy: 600,
      credits: 2500,
    },
    duration: 7200, // 2 hours
    parentIds: ['efficiency_power_level1'],
    childIds: ['efficiency_power_level3'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'efficiency_power_level3': {
    id: 'efficiency_power_level3',
    name: 'Quantum Efficiency',
    description: 'Reduce power consumption by 15% - quantum processing efficiency.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      iron: 1000,
      titanium: 800,
      aluminum: 600,
      energy: 1200,
      credits: 5000,
    },
    duration: 10800, // 3 hours
    parentIds: ['efficiency_power_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== RARE ELEMENTS BRANCH ====================
  'rare_detection_level1': {
    id: 'rare_detection_level1',
    name: 'Rare Element Detection I',
    description: 'Detect and extract rare elements - 5% rare ore yield.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 800,
      titanium: 1200,
      aluminum: 600,
      energy: 1000,
      credits: 4000,
    },
    duration: 10800, // 3 hours
    parentIds: [],
    childIds: ['rare_detection_level2'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'rare_detection_level2': {
    id: 'rare_detection_level2',
    name: 'Rare Element Detection II',
    description: 'Advanced detection systems - 10% rare ore yield.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 2000,
      aluminum: 1000,
      energy: 2000,
      credits: 8000,
    },
    duration: 14400, // 4 hours
    parentIds: ['rare_detection_level1'],
    childIds: ['rare_detection_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'rare_detection_level3': {
    id: 'rare_detection_level3',
    name: 'Legendary Element Extraction',
    description: 'Legendary material detection and extraction - 15% rare ore yield.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 10 },
      { type: 'tech_level', value: 5 },
    ],
    cost: {
      titanium: 3000,
      aluminum: 1500,
      energy: 3500,
      credits: 15000,
    },
    duration: 21600, // 6 hours
    parentIds: ['rare_detection_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== SUSTAINABILITY BRANCH ====================
  'sustainability_level1': {
    id: 'sustainability_level1',
    name: 'Eco-Mining I',
    description: 'Sustainable mining practices - reduce environmental impact by 10%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      iron: 400,
      titanium: 300,
      energy: 400,
      credits: 1500,
    },
    duration: 7200, // 2 hours
    parentIds: [],
    childIds: ['sustainability_level2'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 8,
        isPercentage: true,
      },
    ],
  },

  'sustainability_level2': {
    id: 'sustainability_level2',
    name: 'Advanced Eco-Mining',
    description: 'Advanced sustainable systems - reduce waste by 20%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      iron: 800,
      titanium: 600,
      aluminum: 400,
      energy: 800,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['sustainability_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 15,
        isPercentage: true,
      },
    ],
  },
};

/**
 * Mine Upgrade Tree organization by category
 */
export const MINE_UPGRADE_CATEGORIES = {
  extractionSpeed: [
    'extraction_speed_level1',
    'extraction_speed_level2',
    'extraction_speed_level3',
    'extraction_speed_level4',
  ],
  oreQuality: [
    'ore_quality_level1',
    'ore_quality_level2',
    'ore_quality_level3',
  ],
  deepMining: [
    'deep_mining_level1',
    'deep_mining_level2',
    'deep_mining_level3',
  ],
  storage: [
    'storage_capacity_level1',
    'storage_capacity_level2',
    'storage_capacity_level3',
  ],
  automation: [
    'automation_level1',
    'automation_level2',
  ],
  powerEfficiency: [
    'efficiency_power_level1',
    'efficiency_power_level2',
    'efficiency_power_level3',
  ],
  rareElements: [
    'rare_detection_level1',
    'rare_detection_level2',
    'rare_detection_level3',
  ],
  sustainability: [
    'sustainability_level1',
    'sustainability_level2',
  ],
};
