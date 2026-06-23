/**
 * Factory Upgrade Definitions
 * Upgrade tree for factories with production speed, quality, and efficiency upgrades
 */

import {
  FactoryUpgradeTree,
  FactoryUpgradeNode,
} from './types';

/**
 * Factory Upgrade Tree
 * Tree structure organized by categories:
 * - PRODUCTION branch: Speed improvements
 * - QUALITY branch: Better output quality
 * - CAPACITY branch: More builder pads
 * - EFFICIENCY branch: Resource cost reduction
 */
export const FACTORY_UPGRADE_TREE: FactoryUpgradeTree = {
  // ==================== PRODUCTION SPEED BRANCH ====================
  'production_speed_level1': {
    id: 'production_speed_level1',
    name: 'Production Optimization I',
    description: 'Increase production speed by 5%.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      titanium: 400,
      energy: 200,
      credits: 800,
    },
    duration: 3600, // 1 hour
    parentIds: [],
    childIds: ['production_speed_level2'],
    bonuses: [
      {
        type: 'build_speed',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'production_speed_level2': {
    id: 'production_speed_level2',
    name: 'Production Optimization II',
    description: 'Increase production speed by 10% more.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      titanium: 800,
      aluminum: 400,
      energy: 400,
      credits: 2000,
    },
    duration: 7200, // 2 hours
    parentIds: ['production_speed_level1'],
    childIds: ['production_speed_level3'],
    bonuses: [
      {
        type: 'build_speed',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'production_speed_level3': {
    id: 'production_speed_level3',
    name: 'Production Optimization III',
    description: 'Increase production speed by 15% more.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 6 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1500,
      aluminum: 800,
      energy: 800,
      credits: 5000,
    },
    duration: 10800, // 3 hours
    parentIds: ['production_speed_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'build_speed',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== CAPACITY BRANCH ====================
  'capacity_pads_level1': {
    id: 'capacity_pads_level1',
    name: 'Expansion Module I',
    description: 'Add 1 additional builder pad to the factory.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 1000,
      aluminum: 500,
      energy: 300,
      credits: 1500,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['capacity_pads_level2'],
    bonuses: [
      {
        type: 'payload_capacity', // Reusing for factory capacity
        value: 1,
        isPercentage: false, // 1 additional pad
      },
    ],
  },

  'capacity_pads_level2': {
    id: 'capacity_pads_level2',
    name: 'Expansion Module II',
    description: 'Add 2 more additional builder pads.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 2000,
      aluminum: 1000,
      energy: 600,
      credits: 3500,
    },
    duration: 7200, // 2 hours
    parentIds: ['capacity_pads_level1'],
    childIds: ['capacity_pads_level3'],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 2,
        isPercentage: false, // 2 additional pads
      },
    ],
  },

  'capacity_pads_level3': {
    id: 'capacity_pads_level3',
    name: 'Mega Factory Expansion',
    description: 'Add 3 more builder pads for maximum production capacity.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 4000,
      aluminum: 2000,
      energy: 1200,
      credits: 8000,
    },
    duration: 10800, // 3 hours
    parentIds: ['capacity_pads_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'payload_capacity',
        value: 3,
        isPercentage: false, // 3 additional pads
      },
    ],
  },

  // ==================== EFFICIENCY BRANCH ====================
  'efficiency_cost_level1': {
    id: 'efficiency_cost_level1',
    name: 'Resource Optimization I',
    description: 'Reduce resource costs for production by 5%.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 2 },
    ],
    cost: {
      titanium: 300,
      energy: 150,
      credits: 600,
    },
    duration: 3600, // 1 hour
    parentIds: [],
    childIds: ['efficiency_cost_level2'],
    bonuses: [
      {
        type: 'fuel_efficiency', // Reused for general resource efficiency
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'efficiency_cost_level2': {
    id: 'efficiency_cost_level2',
    name: 'Resource Optimization II',
    description: 'Reduce resource costs for production by 10% more.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 4 },
    ],
    cost: {
      titanium: 600,
      aluminum: 300,
      energy: 300,
      credits: 1500,
    },
    duration: 7200, // 2 hours
    parentIds: ['efficiency_cost_level1'],
    childIds: ['efficiency_cost_level3'],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'efficiency_cost_level3': {
    id: 'efficiency_cost_level3',
    name: 'Advanced Manufacturing',
    description: 'Reduce resource costs by 15% through advanced manufacturing techniques.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 7 },
      { type: 'tech_level', value: 2 },
    ],
    cost: {
      titanium: 1200,
      aluminum: 600,
      energy: 600,
      credits: 3500,
    },
    duration: 10800, // 3 hours
    parentIds: ['efficiency_cost_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'fuel_efficiency',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== QUALITY BRANCH ====================
  'quality_rockets_level1': {
    id: 'quality_rockets_level1',
    name: 'Quality Control I',
    description: 'Improve rocket quality by 5%, increasing launch success chance.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 3 },
    ],
    cost: {
      titanium: 500,
      energy: 300,
      credits: 1000,
    },
    duration: 5400, // 1.5 hours
    parentIds: [],
    childIds: ['quality_rockets_level2'],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 5,
        isPercentage: true,
      },
    ],
  },

  'quality_rockets_level2': {
    id: 'quality_rockets_level2',
    name: 'Quality Control II',
    description: 'Improve rocket quality by 10% more.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 1000,
      aluminum: 500,
      energy: 600,
      credits: 2500,
    },
    duration: 7200, // 2 hours
    parentIds: ['quality_rockets_level1'],
    childIds: ['quality_rockets_level3'],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 10,
        isPercentage: true,
      },
    ],
  },

  'quality_rockets_level3': {
    id: 'quality_rockets_level3',
    name: 'Precision Manufacturing',
    description: 'Achieve precision manufacturing for 15% improved launch success.',
    level: 0,
    maxLevel: 1,
    applicableItemTypes: ['rocket_falcon', 'rocket_starship', 'rocket_soyuz', 'rocket_atlas'],
    requirements: [
      { type: 'lab_level', value: 8 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 2000,
      aluminum: 1000,
      energy: 1000,
      credits: 6000,
    },
    duration: 10800, // 3 hours
    parentIds: ['quality_rockets_level2'],
    childIds: [],
    bonuses: [
      {
        type: 'launch_success_chance',
        value: 15,
        isPercentage: true,
      },
    ],
  },

  // ==================== AUTOMATION BRANCH ====================
  'automation_level1': {
    id: 'automation_level1',
    name: 'Automated Assembly I',
    description: 'Introduce automation systems for 8% speed increase.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 5 },
    ],
    cost: {
      titanium: 1500,
      aluminum: 800,
      energy: 700,
      credits: 3000,
    },
    duration: 9000, // 2.5 hours
    parentIds: ['production_speed_level2'],
    childIds: ['automation_level2'],
    bonuses: [
      {
        type: 'build_speed',
        value: 8,
        isPercentage: true,
      },
    ],
  },

  'automation_level2': {
    id: 'automation_level2',
    name: 'Full Automation',
    description: 'Complete automation system for 12% additional speed boost.',
    level: 0,
    maxLevel: 1,
    requirements: [
      { type: 'lab_level', value: 9 },
      { type: 'tech_level', value: 3 },
    ],
    cost: {
      titanium: 3000,
      aluminum: 1500,
      energy: 1400,
      credits: 7000,
    },
    duration: 14400, // 4 hours
    parentIds: ['automation_level1'],
    childIds: [],
    bonuses: [
      {
        type: 'build_speed',
        value: 12,
        isPercentage: true,
      },
    ],
  },
};

/**
 * Factory Upgrade Tree organization by category
 */
export const FACTORY_UPGRADE_CATEGORIES = {
  production: [
    'production_speed_level1',
    'production_speed_level2',
    'production_speed_level3',
  ],
  capacity: [
    'capacity_pads_level1',
    'capacity_pads_level2',
    'capacity_pads_level3',
  ],
  efficiency: [
    'efficiency_cost_level1',
    'efficiency_cost_level2',
    'efficiency_cost_level3',
  ],
  quality: [
    'quality_rockets_level1',
    'quality_rockets_level2',
    'quality_rockets_level3',
  ],
  automation: [
    'automation_level1',
    'automation_level2',
  ],
};
