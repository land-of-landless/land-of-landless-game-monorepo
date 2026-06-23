/**
 * UPGRADE SYSTEM CONSTANTS & DEFINITIONS
 * Tree-based upgrade system with boilerplate recommendations for game progression
 *
 * Each facility can have multiple upgrade trees with different cost/benefit relationships.
 * Upgrades apply modifiers/bonuses to core facility mechanics.
 */

// ============ LAUNCH SITE UPGRADE TREES ============

export const LAUNCH_SITE_UPGRADE_TREES = {
  ENGINE_TYPE: {
    name: "Engine Type",
    description: "Unlocks different engine technologies for rockets",
    treeId: "engine_type",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "engine_chemical",
        name: "Chemical Engines",
        tier: 1,
        costCoins: 5000,
        costGems: 0,
        upgradeTime: 3600000, // 1 hour
        effects: {
          // 0% boost = baseline
          launchSuccessBonus: 0,
          payloadCapacityBonus: 0,
          launchSpeedBonus: 0,
        },
        description: "Traditional liquid or solid rocket fuel. Baseline performance.",
      },
      2: {
        id: "engine_nuclear",
        name: "Nuclear Thermal Engines",
        tier: 2,
        costCoins: 25000,
        costGems: 50,
        upgradeTime: 7200000, // 2 hours
        effects: {
          launchSuccessBonus: 8, // +8% success chance
          payloadCapacityBonus: 15, // +15% max payload
          launchSpeedBonus: 20, // +20% phase completion speed
        },
        description: "Advanced nuclear propulsion. Higher efficiency and payload.",
        prerequisites: ["engine_chemical"],
      },
      3: {
        id: "engine_ion",
        name: "Ion Drive Engines",
        tier: 3,
        costCoins: 75000,
        costGems: 200,
        upgradeTime: 14400000, // 4 hours
        effects: {
          launchSuccessBonus: 15, // +15% success chance
          payloadCapacityBonus: 35, // +35% max payload
          launchSpeedBonus: 40, // +40% phase speed
        },
        description: "Cutting-edge ion propulsion. Maximum efficiency and payload capacity.",
        prerequisites: ["engine_nuclear"],
      },
    },
  },

  ENGINE_COUNT: {
    name: "Engine Cluster",
    description: "Increase number of engines per launch vehicle",
    treeId: "engine_count",
    maxTier: 4,
    prerequisites: [],
    upgrades: {
      1: {
        id: "engines_1x",
        name: "Single Engine",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          launchSuccessBonus: 0,
          engineCount: 1,
          redundancyBonus: 0,
        },
        description: "Standard single-engine configuration.",
      },
      2: {
        id: "engines_2x",
        name: "Dual Engine",
        tier: 2,
        costCoins: 10000,
        costGems: 25,
        upgradeTime: 5400000, // 1.5 hours
        effects: {
          launchSuccessBonus: 5,
          engineCount: 2,
          redundancyBonus: 3, // +3% redundancy = safer launches
        },
        description: "Two-engine redundancy configuration. Safer launches.",
        prerequisites: ["engines_1x"],
      },
      3: {
        id: "engines_3x",
        name: "Triple Engine",
        tier: 3,
        costCoins: 30000,
        costGems: 100,
        upgradeTime: 10800000, // 3 hours
        effects: {
          launchSuccessBonus: 10,
          engineCount: 3,
          redundancyBonus: 8,
        },
        description: "Three-engine configuration with high redundancy.",
        prerequisites: ["engines_2x"],
      },
      4: {
        id: "engines_4x",
        name: "Quad Engine",
        tier: 4,
        costCoins: 75000,
        costGems: 250,
        upgradeTime: 21600000, // 6 hours
        effects: {
          launchSuccessBonus: 15,
          engineCount: 4,
          redundancyBonus: 15,
        },
        description: "Maximum engine configuration. Extreme reliability.",
        prerequisites: ["engines_3x"],
      },
    },
  },

  REUSABILITY: {
    name: "Rocket Reusability",
    description: "Enable rocket landing and reusability features",
    treeId: "reusability",
    maxTier: 2,
    prerequisites: [],
    upgrades: {
      1: {
        id: "reusable_disabled",
        name: "Expendable Rockets",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          launchPhases: 3, // ignition, ascending, orbit injection
          costPerLaunch: 1.0,
          reuseChance: 0,
        },
        description: "Standard expendable rocket. Destroyed after launch.",
      },
      2: {
        id: "reusable_enabled",
        name: "Reusable Rockets",
        tier: 2,
        costCoins: 100000,
        costGems: 500,
        upgradeTime: 28800000, // 8 hours
        effects: {
          launchPhases: 5, // +return & landing phases
          costPerLaunch: 0.3, // 70% cost reduction on reused rockets
          reuseChance: 85, // 85% chance to successfully land and reuse
        },
        description: "Reusable rockets with landing capability. Dramatically reduces per-launch costs.",
        prerequisites: [],
      },
    },
  },

  FUEL_EFFICIENCY: {
    name: "Fuel Efficiency",
    description: "Reduce fuel consumption and resource requirements",
    treeId: "fuel_efficiency",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "fuel_standard",
        name: "Standard Fuel",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          fuelConsumption: 1.0,
          resourceCost: 1.0,
        },
        description: "Standard fuel consumption baseline.",
      },
      2: {
        id: "fuel_optimized",
        name: "Optimized Fuel Mix",
        tier: 2,
        costCoins: 20000,
        costGems: 50,
        upgradeTime: 5400000,
        effects: {
          fuelConsumption: 0.85, // -15% fuel needed
          resourceCost: 0.9, // -10% resource cost
        },
        description: "Improved fuel mixture reduces consumption by 15%.",
        prerequisites: ["fuel_standard"],
      },
      3: {
        id: "fuel_advanced",
        name: "Advanced Fuel Synthesis",
        tier: 3,
        costCoins: 60000,
        costGems: 200,
        upgradeTime: 10800000,
        effects: {
          fuelConsumption: 0.65, // -35% fuel needed
          resourceCost: 0.75, // -25% resource cost
        },
        description: "Synthetic fuels reduce consumption by 35% and resource costs by 25%.",
        prerequisites: ["fuel_optimized"],
      },
    },
  },

  TRACKING_SYSTEM: {
    name: "Tracking & Navigation",
    description: "Improve launch accuracy and satellite tracking",
    treeId: "tracking_system",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "track_basic",
        name: "Basic Tracking",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          accuracyBonus: 0,
          orbitInjectionSuccessBonus: 0,
        },
        description: "Manual tracking system.",
      },
      2: {
        id: "track_automated",
        name: "Automated Tracking",
        tier: 2,
        costCoins: 15000,
        costGems: 30,
        upgradeTime: 4320000, // 1.2 hours
        effects: {
          accuracyBonus: 5,
          orbitInjectionSuccessBonus: 5, // +5% orbit injection success
        },
        description: "Automated systems increase accuracy and orbital insertion success.",
        prerequisites: ["track_basic"],
      },
      3: {
        id: "track_ai",
        name: "AI Navigation System",
        tier: 3,
        costCoins: 50000,
        costGems: 150,
        upgradeTime: 9000000, // 2.5 hours
        effects: {
          accuracyBonus: 15,
          orbitInjectionSuccessBonus: 15, // +15% orbit injection success
        },
        description: "AI-powered navigation ensures precise orbital insertions.",
        prerequisites: ["track_automated"],
      },
    },
  },
};

// ============ FACTORY UPGRADE TREES ============

export const FACTORY_UPGRADE_TREES = {
  PRODUCTION_SPEED: {
    name: "Production Speed",
    description: "Increase item production/building speed",
    treeId: "production_speed",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "prod_standard",
        name: "Standard Tooling",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          buildSpeedBonus: 0,
          buildTimeMultiplier: 1.0,
        },
        description: "Standard production equipment.",
      },
      2: {
        id: "prod_advanced",
        name: "Advanced Machinery",
        tier: 2,
        costCoins: 15000,
        costGems: 40,
        upgradeTime: 5400000,
        effects: {
          buildSpeedBonus: 20,
          buildTimeMultiplier: 0.8, // -20% build time
        },
        description: "Modern machinery speeds up production by 20%.",
        prerequisites: ["prod_standard"],
      },
      3: {
        id: "prod_robotic",
        name: "Fully Robotic Production",
        tier: 3,
        costCoins: 50000,
        costGems: 150,
        upgradeTime: 10800000,
        effects: {
          buildSpeedBonus: 50,
          buildTimeMultiplier: 0.5, // -50% build time
        },
        description: "Automated robotic systems cut production time in half.",
        prerequisites: ["prod_advanced"],
      },
    },
  },

  BUILDER_PADS: {
    name: "Builder Pads",
    description: "Unlock additional simultaneous construction slots",
    treeId: "builder_pads",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "pads_1",
        name: "Single Pad",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          padCount: 1,
          parallelBuildCapacity: 1,
        },
        description: "One production pad.",
      },
      2: {
        id: "pads_2",
        name: "Dual Pads",
        tier: 2,
        costCoins: 20000,
        costGems: 50,
        upgradeTime: 7200000,
        effects: {
          padCount: 2,
          parallelBuildCapacity: 2,
        },
        description: "Two simultaneous production lines.",
        prerequisites: ["pads_1"],
      },
      3: {
        id: "pads_4",
        name: "Quad Pads",
        tier: 3,
        costCoins: 60000,
        costGems: 200,
        upgradeTime: 14400000,
        effects: {
          padCount: 4,
          parallelBuildCapacity: 4,
        },
        description: "Four simultaneous production lines for maximum throughput.",
        prerequisites: ["pads_2"],
      },
    },
  },

  STORAGE_CAPACITY: {
    name: "Storage Capacity",
    description: "Increase inventory space for manufactured items",
    treeId: "storage_capacity",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "storage_small",
        name: "Small Storage",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          storageCapacity: 100,
          storageMultiplier: 1.0,
        },
        description: "Basic storage for 100 items.",
      },
      2: {
        id: "storage_medium",
        name: "Medium Storage",
        tier: 2,
        costCoins: 12000,
        costGems: 30,
        upgradeTime: 4320000,
        effects: {
          storageCapacity: 500,
          storageMultiplier: 1.5,
        },
        description: "Expanded storage for 500 items (5x increase).",
        prerequisites: ["storage_small"],
      },
      3: {
        id: "storage_large",
        name: "Large Warehouse",
        tier: 3,
        costCoins: 40000,
        costGems: 120,
        upgradeTime: 10800000,
        effects: {
          storageCapacity: 2000,
          storageMultiplier: 5.0,
        },
        description: "Massive warehouse for 2000+ items.",
        prerequisites: ["storage_medium"],
      },
    },
  },

  QUALITY_CONTROL: {
    name: "Quality Control",
    description: "Reduce defect rate and improve item quality",
    treeId: "quality_control",
    maxTier: 2,
    prerequisites: [],
    upgrades: {
      1: {
        id: "quality_basic",
        name: "Basic QC",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          defectRate: 0.05, // 5% defects
          qualityBonus: 0,
        },
        description: "Standard quality control.",
      },
      2: {
        id: "quality_advanced",
        name: "Advanced QC System",
        tier: 2,
        costCoins: 25000,
        costGems: 75,
        upgradeTime: 7200000,
        effects: {
          defectRate: 0.01, // 1% defects (80% reduction)
          qualityBonus: 10,
        },
        description: "Precision QC reduces defects by 80%.",
        prerequisites: ["quality_basic"],
      },
    },
  },
};

// ============ MINE UPGRADE TREES ============

export const MINE_UPGRADE_TREES = {
  EXTRACTION_RATE: {
    name: "Extraction Rate",
    description: "Increase ore/resource extraction speed",
    treeId: "extraction_rate",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "extract_basic",
        name: "Manual Extraction",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          extractionSpeedBonus: 0,
          extractionMultiplier: 1.0,
          resourcePerCycle: 10,
        },
        description: "Hand-mining operations.",
      },
      2: {
        id: "extract_powered",
        name: "Powered Extraction Tools",
        tier: 2,
        costCoins: 18000,
        costGems: 45,
        upgradeTime: 5400000,
        effects: {
          extractionSpeedBonus: 25,
          extractionMultiplier: 1.25, // +25% resources
          resourcePerCycle: 13,
        },
        description: "Mechanical tools increase extraction by 25%.",
        prerequisites: ["extract_basic"],
      },
      3: {
        id: "extract_automated",
        name: "Automated Mining",
        tier: 3,
        costCoins: 55000,
        costGems: 180,
        upgradeTime: 10800000,
        effects: {
          extractionSpeedBonus: 70,
          extractionMultiplier: 1.7, // +70% resources
          resourcePerCycle: 17,
        },
        description: "Fully automated systems increase extraction by 70%.",
        prerequisites: ["extract_powered"],
      },
    },
  },

  MINER_WORKFORCE: {
    name: "Miner Workforce",
    description: "Deploy additional miners to the operation",
    treeId: "miner_workforce",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "miners_1",
        name: "Single Miner",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          minerCount: 1,
          productionSlots: 1,
        },
        description: "One miner.",
      },
      2: {
        id: "miners_3",
        name: "Work Team (3x)",
        tier: 2,
        costCoins: 25000,
        costGems: 60,
        upgradeTime: 7200000,
        effects: {
          minerCount: 3,
          productionSlots: 3,
          teamEfficiencyBonus: 5, // Team synergy +5%
        },
        description: "Three miners working in team. Synergy bonus applies.",
        prerequisites: ["miners_1"],
      },
      3: {
        id: "miners_6",
        name: "Full Crew (6x)",
        tier: 3,
        costCoins: 70000,
        costGems: 200,
        upgradeTime: 14400000,
        effects: {
          minerCount: 6,
          productionSlots: 6,
          teamEfficiencyBonus: 12, // Team synergy +12%
        },
        description: "Six miners with high team synergy.",
        prerequisites: ["miners_3"],
      },
    },
  },

  RESOURCE_TYPE_UNLOCK: {
    name: "Resource Types",
    description: "Unlock ability to mine additional resource types",
    treeId: "resource_type_unlock",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "resource_iron",
        name: "Iron Ore",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          unlockedResources: ["iron"],
        },
        description: "Mine iron ore.",
      },
      2: {
        id: "resource_copper_gold",
        name: "Precious Metals",
        tier: 2,
        costCoins: 30000,
        costGems: 75,
        upgradeTime: 8100000, // 2.25 hours
        effects: {
          unlockedResources: ["iron", "copper", "gold"],
          resourceValueBonus: 20, // +20% sale value
        },
        description: "Unlock copper and gold extraction.",
        prerequisites: ["resource_iron"],
      },
      3: {
        id: "resource_rare_earth",
        name: "Rare Earth Elements",
        tier: 3,
        costCoins: 100000,
        costGems: 300,
        upgradeTime: 16200000, // 4.5 hours
        effects: {
          unlockedResources: ["iron", "copper", "gold", "rare_earth", "platinum"],
          resourceValueBonus: 50, // +50% sale value on all
        },
        description: "Unlock rare earth and platinum extraction.",
        prerequisites: ["resource_copper_gold"],
      },
    },
  },

  SAFETY_SYSTEMS: {
    name: "Safety Systems",
    description: "Improve worker safety and mine stability",
    treeId: "safety_systems",
    maxTier: 2,
    prerequisites: [],
    upgrades: {
      1: {
        id: "safety_basic",
        name: "Basic Safety",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          minerLossRate: 0.02, // 2% miner loss per cycle
          collapseRisk: 0.1, // 10% collapse risk
        },
        description: "Minimal safety measures.",
      },
      2: {
        id: "safety_advanced",
        name: "Advanced Safety",
        tier: 2,
        costCoins: 20000,
        costGems: 50,
        upgradeTime: 6300000, // 1.75 hours
        effects: {
          minerLossRate: 0.002, // 0.2% miner loss (90% reduction)
          collapseRisk: 0.01, // 1% collapse risk
        },
        description: "Professional safety systems protect your workforce.",
        prerequisites: ["safety_basic"],
      },
    },
  },
};

// ============ ENERGY GENERATOR UPGRADE TREES ============

export const ENERGY_GENERATOR_UPGRADE_TREES = {
  POWER_OUTPUT: {
    name: "Power Output",
    description: "Increase energy generation capacity",
    treeId: "power_output",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "power_basic",
        name: "Basic Generator",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          powerOutputBonus: 0,
          megawatts: 10,
          energyPerCycle: 10,
        },
        description: "Standard power generator.",
      },
      2: {
        id: "power_enhanced",
        name: "Enhanced Generator",
        tier: 2,
        costCoins: 22000,
        costGems: 55,
        upgradeTime: 6300000, // 1.75 hours
        effects: {
          powerOutputBonus: 30,
          megawatts: 13,
          energyPerCycle: 13,
        },
        description: "Enhanced design increases output by 30%.",
        prerequisites: ["power_basic"],
      },
      3: {
        id: "power_advanced",
        name: "Advanced Reactor",
        tier: 3,
        costCoins: 65000,
        costGems: 200,
        upgradeTime: 12600000, // 3.5 hours
        effects: {
          powerOutputBonus: 80,
          megawatts: 18,
          energyPerCycle: 18,
        },
        description: "Advanced reactor design increases output by 80%.",
        prerequisites: ["power_enhanced"],
      },
    },
  },

  FUEL_TYPE: {
    name: "Fuel Type",
    description: "Switch to different fuel sources",
    treeId: "fuel_type",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "fuel_coal",
        name: "Coal-Fired",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          fuelType: "coal",
          efficiency: 0.6, // 60% efficiency
          pollutionLevel: 10, // High pollution
          costPerUnit: 1.0,
        },
        description: "Traditional coal burning. Cheap but dirty.",
      },
      2: {
        id: "fuel_solar",
        name: "Solar Array",
        tier: 2,
        costCoins: 35000,
        costGems: 100,
        upgradeTime: 9000000, // 2.5 hours
        effects: {
          fuelType: "solar",
          efficiency: 0.25, // Variable, weather-dependent
          pollutionLevel: 0, // Clean
          costPerUnit: 0.1,
          variabilityRisk: 0.3, // 30% output variance
        },
        description: "Clean solar power. Weather-dependent output.",
        prerequisites: ["fuel_coal"],
      },
      3: {
        id: "fuel_nuclear",
        name: "Nuclear Reactor",
        tier: 3,
        costCoins: 120000,
        costGems: 350,
        upgradeTime: 18000000, // 5 hours
        effects: {
          fuelType: "nuclear",
          efficiency: 0.92, // 92% efficiency (highest)
          pollutionLevel: 0, // Clean
          costPerUnit: 0.05,
          safetyRisk: 0.01, // 1% catastrophic failure risk (mitigated by safety)
        },
        description: "Maximum efficiency. Requires safety upgrades.",
        prerequisites: ["fuel_solar"],
      },
    },
  },

  EFFICIENCY_SYSTEMS: {
    name: "Efficiency Systems",
    description: "Reduce power loss and waste heat",
    treeId: "efficiency_systems",
    maxTier: 2,
    prerequisites: [],
    upgrades: {
      1: {
        id: "efficiency_basic",
        name: "Basic Systems",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          powerLossRate: 0.15, // 15% loss
          wasteHeat: 1.0,
        },
        description: "Standard efficiency.",
      },
      2: {
        id: "efficiency_advanced",
        name: "Advanced Recovery",
        tier: 2,
        costCoins: 28000,
        costGems: 80,
        upgradeTime: 7200000, // 2 hours
        effects: {
          powerLossRate: 0.05, // 5% loss (67% reduction)
          wasteHeat: 0.4, // 60% less waste heat
        },
        description: "Waste heat recovery increases net output by 10-15%.",
        prerequisites: ["efficiency_basic"],
      },
    },
  },

  STORAGE_BATTERIES: {
    name: "Energy Storage",
    description: "Store excess power in batteries",
    treeId: "storage_batteries",
    maxTier: 3,
    prerequisites: [],
    upgrades: {
      1: {
        id: "storage_none",
        name: "No Storage",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          storageCapacity: 0,
          batteryCount: 0,
        },
        description: "All power is used immediately.",
      },
      2: {
        id: "storage_small",
        name: "Small Battery Bank",
        tier: 2,
        costCoins: 20000,
        costGems: 50,
        upgradeTime: 5400000,
        effects: {
          storageCapacity: 100, // MWh
          batteryCount: 1,
          storageEfficiency: 0.85, // 15% loss in storage
        },
        description: "Small battery storage for peak demand handling.",
        prerequisites: ["storage_none"],
      },
      3: {
        id: "storage_large",
        name: "Large Battery Bank",
        tier: 3,
        costCoins: 60000,
        costGems: 180,
        upgradeTime: 10800000,
        effects: {
          storageCapacity: 500, // MWh
          batteryCount: 5,
          storageEfficiency: 0.95, // 5% loss (advanced batteries)
        },
        description: "Massive storage for grid stabilization.",
        prerequisites: ["storage_small"],
      },
    },
  },

  SAFETY_CONTAINMENT: {
    name: "Safety & Containment",
    description: "Protect against catastrophic failures",
    treeId: "safety_containment",
    maxTier: 2,
    prerequisites: [],
    upgrades: {
      1: {
        id: "safety_minimal",
        name: "Basic Containment",
        tier: 1,
        costCoins: 0,
        costGems: 0,
        upgradeTime: 0,
        effects: {
          failureRiskReduction: 0,
          radiationLeakRisk: 0.05, // 5% leak risk
        },
        description: "Minimal safety systems.",
      },
      2: {
        id: "safety_full",
        name: "Full Safety Containment",
        tier: 2,
        costCoins: 45000,
        costGems: 150,
        upgradeTime: 12600000, // 3.5 hours
        effects: {
          failureRiskReduction: 0.95, // 95% risk reduction
          radiationLeakRisk: 0.001, // 0.1% leak risk
        },
        description: "Multiple redundant safety systems. Recommended for nuclear.",
        prerequisites: ["safety_minimal"],
      },
    },
  },
};

// ============ UPGRADE TREE UTILITIES ============

export type UpgradeEffect = Record<string, any>;

export interface UpgradeNode {
  id: string;
  name: string;
  tier: number;
  costCoins: number;
  costGems: number;
  upgradeTime: number; // milliseconds
  effects: UpgradeEffect;
  description: string;
  prerequisites?: string[];
}

export interface UpgradeTree {
  name: string;
  description: string;
  treeId: string;
  maxTier: number;
  prerequisites: string[];
  upgrades: Record<number, UpgradeNode>;
}

/**
 * Calculate total effect of upgrade tree progression
 * Useful for showing cumulative bonuses
 */
export function calculateCumulativeEffects(
  tree: UpgradeTree,
  currentTier: number
): UpgradeEffect {
  const effects: UpgradeEffect = {};

  for (let tier = 1; tier <= Math.min(currentTier, tree.maxTier); tier++) {
    const upgrade = tree.upgrades[tier];
    if (!upgrade) continue;

    Object.entries(upgrade.effects).forEach(([key, value]) => {
      if (typeof value === "number" && !key.includes("Cost")) {
        // Accumulate numeric bonuses (except costs)
        effects[key] = (effects[key] || 0) + value;
      } else {
        // Override non-numeric values (like lists, types)
        effects[key] = value;
      }
    });
  }

  return effects;
}

/**
 * Calculate upgrade cost for a specific node
 */
export function calculateUpgradeCost(node: UpgradeNode): {
  coins: number;
  gems: number;
} {
  return {
    coins: node.costCoins,
    gems: node.costGems,
  };
}

/**
 * Check if upgrade prerequisites are met
 */
export function checkPrerequisites(
  prerequisiteIds: string[],
  completedUpgrades: Set<string>
): boolean {
  return prerequisiteIds.every(id => completedUpgrades.has(id));
}

/**
 * Get next available upgrade in tree
 */
export function getNextUpgrade(tree: UpgradeTree, currentTier: number): UpgradeNode | null {
  const nextTier = currentTier + 1;
  if (nextTier > tree.maxTier) return null;
  return tree.upgrades[nextTier] || null;
}
