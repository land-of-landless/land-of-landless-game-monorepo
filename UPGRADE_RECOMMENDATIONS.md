# 🎮 Upgrade System Recommendations & Boilerplate

This document provides upgrade recommendations and boilerplate implementations across all four facilities. **These are suggestions** — curate and modify as needed for your game balance.

---

## 📋 Table of Contents

1. [Launch Site Detailed Recommendations](#launch-site-detailed-recommendations)
2. [Mine Detailed Recommendations](#mine-detailed-recommendations)
3. [Energy Generator Detailed Recommendations](#energy-generator-detailed-recommendations)
4. [Factory Additional Paths](#factory-additional-paths)
5. [Cross-Facility Synergies](#cross-facility-synergies)
6. [Implementation Patterns](#implementation-patterns)

---

## Launch Site Detailed Recommendations

### Current Trees (Already in upgrades.ts):
- ✅ **ENGINE_TYPE** — Chemical → Ion → Plasma (10-25% boost per tier)
- ✅ **ENGINE_COUNT** — 1 → 4 engines (redundancy & parallel ignition)
- ✅ **REUSABILITY** — Expendable → Reusable (5-phase launch with 85% reuse chance)
- ✅ **FUEL_EFFICIENCY** — Fuel consumption reduction (-10% per tier)
- ✅ **TRACKING_SYSTEM** — Orbit injection accuracy

### Additional Upgrade Trees to Consider:

#### 1. **PAYLOAD_TECHNOLOGY** (Tier 1-3)
Increases what you can launch with better capsule/payload tech.

```typescript
{
  name: "Payload Technology",
  description: "Advanced payload packaging and protection systems",
  treeId: "PAYLOAD_TECHNOLOGY",
  maxTier: 3,
  prerequisites: [],
  upgrades: {
    1: {
      id: "payload_tech_1",
      name: "Standard Payload Capsule",
      tier: 1,
      costCoins: 5000,
      costGems: 50,
      upgradeTime: 3600, // 1 hour
      effects: {
        payloadCapacityBonus: 15, // +15%
        payloadProtection: 20, // Damage reduction
        launchSuccessBonus: 5,
      },
      description: "Reinforced capsule for basic cargo protection"
    },
    2: {
      id: "payload_tech_2",
      name: "Advanced Heat Shield Capsule",
      tier: 2,
      costCoins: 12000,
      costGems: 120,
      upgradeTime: 7200,
      effects: {
        payloadCapacityBonus: 25,
        payloadProtection: 40, // Better re-entry protection
        reentrySuccessBonus: 15,
        launchSuccessBonus: 8,
      },
      description: "Multi-layer heat shield for payload protection during re-entry",
      prerequisites: ["payload_tech_1"]
    },
    3: {
      id: "payload_tech_3",
      name: "Quantum-Shielded Payload Bay",
      tier: 3,
      costCoins: 28000,
      costGems: 280,
      upgradeTime: 14400,
      effects: {
        payloadCapacityBonus: 40,
        payloadProtection: 75,
        reentrySuccessBonus: 30,
        launchSuccessBonus: 12,
      },
      description: "Experimental quantum field containment for ultimate payload safety",
      prerequisites: ["payload_tech_2"]
    }
  }
}
```

#### 2. **GUIDANCE_SYSTEMS** (Tier 1-2)
Better targeting and guidance = higher accuracy & orbital injection success.

```typescript
{
  name: "Guidance Systems",
  description: "Precision navigation and guidance computers",
  treeId: "GUIDANCE_SYSTEMS",
  maxTier: 2,
  prerequisites: ["TRACKING_SYSTEM"], // Requires tracking first
  upgrades: {
    1: {
      id: "guidance_1",
      name: "Inertial Navigation System (INS)",
      tier: 1,
      costCoins: 8000,
      costGems: 80,
      upgradeTime: 5400,
      effects: {
        orbitInjectionAccuracy: 20, // +20% accuracy
        orbitInjectionSuccessBonus: 15,
        launchSuccessBonus: 10,
      },
      description: "Basic gyro-based navigation for trajectory correction"
    },
    2: {
      id: "guidance_2",
      name: "AI-Assisted Navigation",
      tier: 2,
      costCoins: 18000,
      costGems: 180,
      upgradeTime: 10800,
      effects: {
        orbitInjectionAccuracy: 40,
        orbitInjectionSuccessBonus: 30,
        launchSuccessBonus: 20,
        costPerLaunch: -15, // AI optimizes fuel burn
      },
      description: "Machine learning flight paths for optimal fuel efficiency",
      prerequisites: ["guidance_1"]
    }
  }
}
```

#### 3. **LAUNCH_PAD_IMPROVEMENTS** (Tier 1-3)
Better infrastructure = faster launch sequences, less downtime, parallel launches.

```typescript
{
  name: "Launch Pad Infrastructure",
  description: "Facility upgrades for faster launch prep and parallel operations",
  treeId: "LAUNCH_PAD_IMPROVEMENTS",
  maxTier: 3,
  prerequisites: [],
  upgrades: {
    1: {
      id: "launch_pad_1",
      name: "Rapid Fueling System",
      tier: 1,
      costCoins: 4000,
      costGems: 40,
      upgradeTime: 2700,
      effects: {
        launchPrepTimeBonus: -20, // -20% prep time
        launchSuccessBonus: 5,
        fuelLoadingSpeed: 30,
      },
      description: "Automated refueling infrastructure for quicker turnaround"
    },
    2: {
      id: "launch_pad_2",
      name: "Dual-Pad Complex",
      tier: 2,
      costCoins: 10000,
      costGems: 100,
      upgradeTime: 7200,
      effects: {
        parallelLaunchSlots: 2, // Can prep 2 rockets simultaneously
        launchPrepTimeBonus: -35,
        launchSuccessBonus: 10,
      },
      description: "Expanded facility allows simultaneous rocket preparation",
      prerequisites: ["launch_pad_1"]
    },
    3: {
      id: "launch_pad_3",
      name: "Mega Launch Complex",
      tier: 3,
      costCoins: 22000,
      costGems: 220,
      upgradeTime: 14400,
      effects: {
        parallelLaunchSlots: 4,
        launchPrepTimeBonus: -50,
        launchSuccessBonus: 15,
        costPerLaunch: -20,
      },
      description: "Industrial-scale launch facility with 4 independent pads",
      prerequisites: ["launch_pad_2"]
    }
  }
}
```

---

## Mine Detailed Recommendations

### Current Trees (Already in upgrades.ts):
- ✅ **EXTRACTION_RATE** — Faster mining cycles
- ✅ **MINER_WORKFORCE** — More miners, team bonuses
- ✅ **RESOURCE_TYPE_UNLOCK** — Coal → Iron → Rare Minerals
- ✅ **SAFETY_SYSTEMS** — Reduce miner loss & collapse risk

### Additional Upgrade Trees to Consider:

#### 1. **DEEP_MINING** (Tier 1-3)
Access deeper, rarer resources but with higher risk.

```typescript
{
  name: "Deep Mining Operations",
  description: "Technology to access deeper mineral deposits with higher yields",
  treeId: "DEEP_MINING",
  maxTier: 3,
  prerequisites: ["SAFETY_SYSTEMS"], // Need safety before going deep
  upgrades: {
    1: {
      id: "deep_mining_1",
      name: "Basic Tunneling Equipment",
      tier: 1,
      costCoins: 6000,
      costGems: 60,
      upgradeTime: 5400,
      effects: {
        depthAccessLevel: 1, // Can mine at depth level 1
        resourceValueBonus: 20, // 20% more value
        collapseRisk: 25, // But 25% higher collapse risk
        minerLossRate: 15,
      },
      description: "Reinforced drilling equipment for deeper shafts"
    },
    2: {
      id: "deep_mining_2",
      name: "Advanced Drill Systems",
      tier: 2,
      costCoins: 14000,
      costGems: 140,
      upgradeTime: 10800,
      effects: {
        depthAccessLevel: 2,
        resourceValueBonus: 40,
        extractionMultiplier: 1.3,
        collapseRisk: 20, // Safety improves
        minerLossRate: 10,
      },
      description: "Precision drilling reduces risk while accessing deeper resources",
      prerequisites: ["deep_mining_1"]
    },
    3: {
      id: "deep_mining_3",
      name: "Quantum Boring Technology",
      tier: 3,
      costCoins: 32000,
      costGems: 320,
      upgradeTime: 18000,
      effects: {
        depthAccessLevel: 3, // Max depth
        resourceValueBonus: 60,
        extractionMultiplier: 1.6,
        collapseRisk: 5, // Very safe now
        minerLossRate: 2,
      },
      description: "Experimental tech for safe ultra-deep mining",
      prerequisites: ["deep_mining_2"]
    }
  }
}
```

#### 2. **AUTOMATION_DRONES** (Tier 1-3)
Autonomous mining drones = less miner loss, higher consistency, no human risk.

```typescript
{
  name: "Mining Automation (Drones)",
  description: "Autonomous drones for safer, consistent resource extraction",
  treeId: "AUTOMATION_DRONES",
  maxTier: 3,
  prerequisites: [],
  upgrades: {
    1: {
      id: "drones_1",
      name: "Basic Mining Drones",
      tier: 1,
      costCoins: 8000,
      costGems: 80,
      upgradeTime: 7200,
      effects: {
        droneCount: 2,
        minerLossRate: -50, // 50% reduction in losses
        extractionConsistency: 30, // More predictable output
      },
      description: "Simple drones handle routine extraction tasks"
    },
    2: {
      id: "drones_2",
      name: "Smart Swarm Drones",
      tier: 2,
      costCoins: 18000,
      costGems: 180,
      upgradeTime: 14400,
      effects: {
        droneCount: 6,
        minerLossRate: -80,
        extractionConsistency: 60,
        extractionSpeedBonus: 25,
      },
      description: "AI-coordinated drone swarms work in perfect sync",
      prerequisites: ["drones_1"]
    },
    3: {
      id: "drones_3",
      name: "Quantum Swarm Collective",
      tier: 3,
      costCoins: 40000,
      costGems: 400,
      upgradeTime: 21600,
      effects: {
        droneCount: 15,
        minerLossRate: -95, // Almost no losses
        extractionConsistency: 95, // Extremely stable
        extractionSpeedBonus: 50,
        collapseRisk: -40,
      },
      description: "Linked quantum processors enable perfect coordination",
      prerequisites: ["drones_2"]
    }
  }
}
```

#### 3. **PROCESSING_PLANTS** (Tier 1-2)
On-site mineral processing = extract more value without shipping raw ore.

```typescript
{
  name: "On-Site Processing",
  description: "Refine minerals at the mine for higher value extraction",
  treeId: "PROCESSING_PLANTS",
  maxTier: 2,
  prerequisites: [],
  upgrades: {
    1: {
      id: "processing_1",
      name: "Basic Refinery",
      tier: 1,
      costCoins: 7000,
      costGems: 70,
      upgradeTime: 6000,
      effects: {
        resourceValueBonus: 25,
        processingCapacity: 30,
        conversionEfficiency: 80,
      },
      description: "Simple smelter for basic mineral processing"
    },
    2: {
      id: "processing_2",
      name: "Advanced Processing Complex",
      tier: 2,
      costCoins: 16000,
      costGems: 160,
      upgradeTime: 12000,
      effects: {
        resourceValueBonus: 50,
        processingCapacity: 70,
        conversionEfficiency: 95,
        byProductYield: 15, // Generate secondary resources
      },
      description: "Industrial plant extracts maximum value and useful by-products",
      prerequisites: ["processing_1"]
    }
  }
}
```

---

## Energy Generator Detailed Recommendations

### Current Trees (Already in upgrades.ts):
- ✅ **POWER_OUTPUT** — More megawatts
- ✅ **FUEL_TYPE** — Coal → Solar → Nuclear (with tradeoffs)
- ✅ **EFFICIENCY_SYSTEMS** — Reduce power loss & waste heat
- ✅ **STORAGE_BATTERIES** — Battery capacity & efficiency
- ✅ **SAFETY_CONTAINMENT** — Nuclear safety systems

### Additional Upgrade Trees to Consider:

#### 1. **RENEWABLE_TRANSITION** (Tier 1-3)
Move from coal to solar, wind, geothermal with different characteristics.

```typescript
{
  name: "Renewable Energy Transition",
  description: "Unlock renewable energy sources as alternatives to fossil fuels",
  treeId: "RENEWABLE_TRANSITION",
  maxTier: 3,
  prerequisites: [],
  upgrades: {
    1: {
      id: "renewable_1",
      name: "Solar Panel Array",
      tier: 1,
      costCoins: 7000,
      costGems: 70,
      upgradeTime: 6000,
      effects: {
        unlockedEnergyType: "SOLAR",
        powerOutput: 500, // MW
        efficiency: 25,
        pollutionLevel: 0,
        weatherVariability: 40, // Performance varies with weather
        costPerUnit: 5,
      },
      description: "Harness solar energy with cost-effective panels"
    },
    2: {
      id: "renewable_2",
      name: "Wind & Tidal Farm",
      tier: 2,
      costCoins: 15000,
      costGems: 150,
      upgradeTime: 12000,
      effects: {
        unlockedEnergyType: "WIND_TIDAL",
        powerOutput: 800,
        efficiency: 35,
        pollutionLevel: 0,
        weatherVariability: 25,
        costPerUnit: 4,
      },
      description: "Wind turbines and tidal generators for reliable green power",
      prerequisites: ["renewable_1"]
    },
    3: {
      id: "renewable_3",
      name: "Hybrid Renewable Grid",
      tier: 3,
      costCoins: 35000,
      costGems: 350,
      upgradeTime: 18000,
      effects: {
        unlockedEnergyType: "HYBRID_RENEWABLE",
        powerOutput: 1200,
        efficiency: 45,
        pollutionLevel: 0,
        weatherVariability: 10,
        costPerUnit: 3,
        stabilityBonus: 30,
      },
      description: "Interconnected renewable sources for stable, clean power",
      prerequisites: ["renewable_2"]
    }
  }
}
```

#### 2. **GRID_MANAGEMENT** (Tier 1-2)
Manage power distribution more efficiently across facilities.

```typescript
{
  name: "Smart Grid Management",
  description: "AI-driven energy distribution and load balancing",
  treeId: "GRID_MANAGEMENT",
  maxTier: 2,
  prerequisites: [],
  upgrades: {
    1: {
      id: "grid_1",
      name: "Basic Load Balancer",
      tier: 1,
      costCoins: 6000,
      costGems: 60,
      upgradeTime: 5400,
      effects: {
        powerLossRate: -15,
        gridStability: 40,
        distributionEfficiency: 85,
      },
      description: "Automated systems prevent power surges and blackouts"
    },
    2: {
      id: "grid_2",
      name: "AI Energy Dispatcher",
      tier: 2,
      costCoins: 14000,
      costGems: 140,
      upgradeTime: 10800,
      effects: {
        powerLossRate: -35,
        gridStability: 80,
        distributionEfficiency: 98,
        predictiveLoad: true, // Predict demand ahead of time
      },
      description: "Machine learning predicts and optimizes energy distribution",
      prerequisites: ["grid_1"]
    }
  }
}
```

#### 3. **FUSION_RESEARCH** (Tier 1-2)
High-risk, high-reward experimental fusion technology.

```typescript
{
  name: "Fusion Research Program",
  description: "Experimental fusion power for unlimited clean energy (if successful)",
  treeId: "FUSION_RESEARCH",
  maxTier: 2,
  prerequisites: ["SAFETY_CONTAINMENT"], // Absolutely needs safety first!
  upgrades: {
    1: {
      id: "fusion_1",
      name: "Experimental Fusion Reactor",
      tier: 1,
      costCoins: 50000,
      costGems: 500,
      upgradeTime: 36000, // 10 hours!
      effects: {
        unlockedEnergyType: "FUSION",
        powerOutput: 2000, // Massive!
        efficiency: 75,
        pollutionLevel: 0,
        failureRisk: 20, // But risky
        explosionRisk: 15,
        costPerUnit: 0.1,
      },
      description: "First-generation fusion reactor with high output but instability"
    },
    2: {
      id: "fusion_2",
      name: "Stable Fusion Reactor",
      tier: 2,
      costCoins: 80000,
      costGems: 800,
      upgradeTime: 54000, // 15 hours!
      effects: {
        powerOutput: 3000,
        efficiency: 92,
        failureRisk: 5,
        explosionRisk: 2,
        costPerUnit: 0.05,
        energyOverflowProtection: 50,
      },
      description: "Stabilized fusion provides virtually unlimited clean power",
      prerequisites: ["fusion_1"]
    }
  }
}
```

---

## Factory Additional Paths

### Current Trees (Already in upgrades.ts):
- ✅ **PRODUCTION_SPEED** — Build faster
- ✅ **BUILDER_PADS** — More parallel builds
- ✅ **STORAGE_CAPACITY** — Store more items
- ✅ **QUALITY_CONTROL** — Fewer defects

### Additional Recommendations:

#### 1. **BLUEPRINT_OPTIMIZATION** (Tier 1-2)
Better designs = lower resource costs, higher quality.

```typescript
{
  name: "Blueprint Optimization AI",
  description: "Use AI to design more efficient products",
  treeId: "BLUEPRINT_OPTIMIZATION",
  maxTier: 2,
  prerequisites: [],
  upgrades: {
    1: {
      id: "blueprint_1",
      name: "CAD Optimization Level 1",
      tier: 1,
      costCoins: 5000,
      costGems: 50,
      upgradeTime: 4500,
      effects: {
        resourceCostReduction: 10, // 10% cheaper to build
        qualityBonus: 15,
        designTime: -5,
      },
      description: "Basic AI assistance in design phase"
    },
    2: {
      id: "blueprint_2",
      name: "Quantum Design Algorithm",
      tier: 2,
      costCoins: 12000,
      costGems: 120,
      upgradeTime: 9000,
      effects: {
        resourceCostReduction: 25,
        qualityBonus: 35,
        designTime: -15,
        defectRate: -30,
      },
      description: "Advanced algorithms find optimal designs automatically",
      prerequisites: ["blueprint_1"]
    }
  }
}
```

#### 2. **RECYCLING_CENTER** (Tier 1-2)
Reuse failed/defective products.

```typescript
{
  name: "Recycling & Refurbishment",
  description: "Recover materials from failed builds and defects",
  treeId: "RECYCLING_CENTER",
  maxTier: 2,
  prerequisites: [],
  upgrades: {
    1: {
      id: "recycle_1",
      name: "Basic Recycling",
      tier: 1,
      costCoins: 4000,
      costGems: 40,
      upgradeTime: 3600,
      effects: {
        materialRecoveryRate: 40,
        wasteMaterialValue: 20,
      },
      description: "Recover 40% of materials from defective products"
    },
    2: {
      id: "recycle_2",
      name: "Advanced Recycling",
      tier: 2,
      costCoins: 9000,
      costGems: 90,
      upgradeTime: 7200,
      effects: {
        materialRecoveryRate: 75,
        wasteMaterialValue: 50,
        defectRate: -10, // Fewer defects needed
      },
      description: "Recover 75% of materials with minimal waste",
      prerequisites: ["recycle_1"]
    }
  }
}
```

---

## Cross-Facility Synergies

These aren't separate upgrades but rather **combinations** that unlock powerful effects:

### 🚀 **Launch Site + Factory Synergy**
**"Integrated Aerospace Manufacturing"**
- Factory produces better rocket components
- Launch Site benefits from quality improvements
- **Effect:** Launch success +20%, Cost per launch -25%

```typescript
// Triggered when both have:
// - Factory: QUALITY_CONTROL Tier 2+
// - Launch Site: PAYLOAD_TECHNOLOGY Tier 2+
synergy: {
  id: "synergy_aerospace",
  name: "Integrated Aerospace Manufacturing",
  bonuses: {
    launchSuccessBonus: 20,
    costPerLaunch: -25,
    buildQuality: 40,
  }
}
```

### ⛏️ **Mine + Energy Generator Synergy**
**"Integrated Resource Processing"**
- Mines extract resources for fuel/minerals
- Energy generators power mining operations
- **Effect:** Mining efficiency +30%, Power cost -20%

```typescript
synergy: {
  id: "synergy_extraction",
  name: "Integrated Resource Processing",
  bonuses: {
    extractionSpeedBonus: 30,
    costPerPowerUnit: -20,
    resourceValueBonus: 15,
  }
}
```

### 🏭 **Factory + Energy Generator Synergy**
**"Power-Intensive Manufacturing"**
- Factory needs lots of energy
- Energy generators optimized for factory loads
- **Effect:** Build speed +40%, Power efficiency +25%

```typescript
synergy: {
  id: "synergy_factory_power",
  name: "Power-Intensive Manufacturing",
  bonuses: {
    buildSpeedBonus: 40,
    powerEfficiency: 25,
    parallelBuildCapacity: 1, // Bonus pad effectively
  }
}
```

### 🌍 **All Four Facilities Synergy**
**"Planetary Colonization Initiative"** (Ultimate unlock)
- Requires significant investment in all facilities
- Unlocks super-efficient operations
- **Effect:** All operations +50% efficiency, -30% costs

```typescript
synergy: {
  id: "synergy_planetary_colonization",
  name: "Planetary Colonization Initiative",
  requirements: {
    launchSiteMinTier: 5,
    factoryMinTier: 4,
    mineMinTier: 4,
    energyMinTier: 5,
  },
  bonuses: {
    allEfficiencies: 50,
    allCosts: -30,
    prestigeMultiplier: 2,
  }
}
```

---

## Implementation Patterns

### Pattern 1: Tree Integration in UpgradeService

```typescript
// In UpgradeService.ts, add new trees to the resolver

import { LAUNCH_SITE_UPGRADE_TREES } from "@/constants/upgrades.ts";

static getUpgradeTree(facilityType: string, treeId: string): UpgradeTree | null {
  let trees;
  
  switch (facilityType) {
    case "LAUNCH_SITE":
      trees = LAUNCH_SITE_UPGRADE_TREES;
      break;
    case "MINE":
      trees = MINE_UPGRADE_TREES;
      break;
    case "ENERGY_GENERATOR":
      trees = ENERGY_GENERATOR_UPGRADE_TREES;
      break;
    case "FACTORY":
      trees = FACTORY_UPGRADE_TREES;
      break;
    default:
      return null;
  }
  
  return trees[treeId] ?? null;
}
```

### Pattern 2: Synergy Calculation

```typescript
// Add to UpgradeService

static calculateSynergies(
  userId: string,
  facilityProgresses: Map<string, UserUpgradeProgress>
): SynergyBonus[] {
  const synergies: SynergyBonus[] = [];
  
  // Check for Launch Site + Factory synergy
  const launchTier = facilityProgresses.get("LAUNCH_SITE")?.trees.get("PAYLOAD_TECHNOLOGY")?.currentTier ?? 0;
  const factoryTier = facilityProgresses.get("FACTORY")?.trees.get("QUALITY_CONTROL")?.currentTier ?? 0;
  
  if (launchTier >= 2 && factoryTier >= 2) {
    synergies.push({
      id: "synergy_aerospace",
      name: "Integrated Aerospace Manufacturing",
      bonuses: {
        launchSuccessBonus: 20,
        costPerLaunch: -25,
      }
    });
  }
  
  // ... more synergy checks
  
  return synergies;
}
```

### Pattern 3: Bonus Application in Services

```typescript
// In LaunchSiteService.ts

async calculateLaunchSuccessChance(
  userId: string,
  baseChance: number,
  facilityId: string
): Promise<number> {
  // Get user's upgrade progress
  const userProgress = await UpgradeDAO.findUserUpgradeProgress(
    userId,
    "LAUNCH_SITE",
    facilityId
  );
  
  // Apply upgrades
  const upgradeBonus = LaunchSiteUpgradeUtils.calculateLaunchSuccessChance(
    baseChance,
    userProgress
  );
  
  // Get synergies
  const allFacilityProgresses = await UpgradeDAO.findAllUserFacilityProgress(userId);
  const synergies = UpgradeService.calculateSynergies(userId, allFacilityProgresses);
  
  // Apply synergy bonuses
  let finalChance = upgradeBonus;
  for (const synergy of synergies) {
    if (synergy.bonuses.launchSuccessBonus) {
      finalChance += synergy.bonuses.launchSuccessBonus;
    }
  }
  
  return Math.min(finalChance, 100); // Cap at 100%
}
```

### Pattern 4: Tree Recommendations Algorithm

```typescript
// Suggested upgrade path based on play style

interface UpgradeRecommendation {
  treeId: string;
  nextUpgradeId: string;
  reason: string;
  synergies: string[];
}

static getRecommendations(
  facilityType: string,
  userProgress: UserUpgradeProgress,
  allFacilityProgresses: Map<string, UserUpgradeProgress>
): UpgradeRecommendation[] {
  const recommendations: UpgradeRecommendation[] = [];
  
  // Example: For Launch Site, if user has low success rate, recommend tracking system
  if (userProgress.trees.get("TRACKING_SYSTEM")?.currentTier === 0) {
    recommendations.push({
      treeId: "TRACKING_SYSTEM",
      nextUpgradeId: "tracking_1",
      reason: "Tracking System improves launch success accuracy by 15%",
      synergies: ["GUIDANCE_SYSTEMS"]
    });
  }
  
  // Example: If Factory has Quality Control but no recycling, recommend recycling
  if (allFacilityProgresses.get("FACTORY")?.trees.get("QUALITY_CONTROL")?.currentTier! >= 2 &&
      allFacilityProgresses.get("FACTORY")?.trees.get("RECYCLING_CENTER")?.currentTier === 0) {
    recommendations.push({
      treeId: "RECYCLING_CENTER",
      nextUpgradeId: "recycle_1",
      reason: "Pair with Quality Control to recover 40% of failed build materials",
      synergies: ["QUALITY_CONTROL"]
    });
  }
  
  return recommendations;
}
```

---

## Implementation Checklist

- [ ] Add new upgrade trees to `constants/upgrades.ts`
- [ ] Update type definitions for new effect keys
- [ ] Create `UpgradeDAO` with persist methods
- [ ] Create `UpgradeController` with REST endpoints
- [ ] Integrate bonuses into `LaunchSiteService`, `MineService`, `FactoryService`, `EnergyGeneratorService`
- [ ] Add synergy calculation to `UpgradeService`
- [ ] Add recommendation algorithm to `UpgradeService`
- [ ] Test upgrade purchase/completion flow
- [ ] Verify bonuses apply correctly
- [ ] Test synergy triggers
- [ ] Load test with 1000 concurrent users

---

## Design Philosophy

**These upgrades follow these principles:**

1. **Meaningful Choices** — Each upgrade path creates unique playstyles
   - Chemical engines = fast, cheap, high-risk
   - Ion engines = expensive, reliable, slow
   - Plasma engines = ultimate, experimental, risky

2. **Progression Locks** — Higher tiers require lower tiers
   - `DEEP_MINING` requires `SAFETY_SYSTEMS` first
   - `FUSION_RESEARCH` requires `SAFETY_CONTAINMENT` first

3. **Risk vs. Reward**
   - Deep mining = higher value, higher collapse risk
   - Fusion = unlimited power, but explosion risk
   - Renewable = clean but weather-dependent

4. **Synergies Encourage Broad Play**
   - Specialized players (4 pads + speed) still compete with balanced players (all synergies)
   - Late-game: "Planetary Colonization Initiative" rewards the dedicated

5. **Cost Scaling**
   - Early upgrades: 4k-8k coins, 40-80 gems
   - Mid upgrades: 12k-20k coins, 120-200 gems
   - Late upgrades: 28k-80k coins, 280-800 gems
   - Can be tuned based on your game economy

---

**Next:** Review these recommendations, keep what you like, modify as needed, then we'll integrate into the actual service logic! 🚀
