# 🎮 UPGRADE SYSTEM GUIDE
## Land of Landless - Game Server

---

## Overview

The upgrade system is a **tree-based progression mechanic** where players unlock technology branches for different facilities (Launch Site, Factory, Miners, Energy Generators). Each facility can have multiple independent upgrade trees that provide cumulative bonuses and unlock new mechanics.

### Key Design Principles

1. **Tree-Based**: Multiple upgrade trees per facility, not linear progression
2. **Cumulative Bonuses**: Upgrades stack—completing tier 2 and tier 3 means you get both tier 2 AND tier 3 effects
3. **Prerequisites**: Some upgrades require others to be completed first
4. **Tiered Costs**: Higher-tier upgrades cost more coins and gems, take longer to complete
5. **Mechanics Unlocking**: Some upgrades don't just add bonuses—they unlock entirely new features (e.g., reusable rockets, solar power)

---

## Architecture

### Core Files

```
src/
├── constants/upgrades.ts                  # All upgrade definitions & utilities
├── services/upgrades/UpgradeService.ts   # Business logic for progression
├── daos/postgres/upgrades.ts             # (TODO) Persistence layer for upgrade tracking
└── api/v1/controllers/upgrades.ts        # (TODO) API endpoints
```

### Data Model

```typescript
interface UpgradeNode {
  id: string;                    // Unique ID per upgrade
  name: string;                  // Human-readable name
  tier: number;                  // Position in tree (1, 2, 3...)
  costCoins: number;             // Coin cost to start upgrade
  costGems: number;              // Gem cost to start upgrade
  upgradeTime: number;           // Time in milliseconds to complete
  effects: UpgradeEffect;        // Bonuses/changes applied when complete
  description: string;           // What this upgrade does
  prerequisites?: string[];      // IDs of upgrades that must be done first
}

interface UpgradeTree {
  name: string;                  // "Engine Type", "Production Speed", etc.
  description: string;
  treeId: string;                // Unique identifier (engine_type, production_speed)
  maxTier: number;               // Max tier level in this tree
  prerequisites: string[];       // If entire tree has pre-reqs
  upgrades: Record<number, UpgradeNode>; // Indexed by tier
}

interface UserUpgradeProgress {
  facilityType: "launchSite" | "factory" | "mine" | "energyGenerator";
  facilityId: string;
  userId: string;
  treeProgress: Record<string, number>;  // treeId -> currentTier
  completedUpgrades: Set<string>;        // All completed upgrade IDs
  upgradeInProgress?: {
    upgradeId: string;
    startTime: Date;
    completionTime: Date;
  };
}
```

---

## Upgrade Trees & Recommendations

### 🚀 LAUNCH SITE UPGRADE TREES

#### 1. **Engine Type** (`engine_type`)
Progression of rocket engine technology with increasing efficiency and payload.

| Tier | Upgrade | Cost | Time | Bonuses | Notes |
|------|---------|------|------|---------|-------|
| 1 | Chemical Engines | 5k coins | 1h | Baseline (0% bonus) | Default starting tech |
| 2 | Nuclear Thermal | 25k coins + 50 gems | 2h | +8% success, +15% payload, +20% speed | Better efficiency |
| 3 | Ion Drive | 75k coins + 200 gems | 4h | +15% success, +35% payload, +40% speed | Space-grade propulsion |

**Philosophy**: Each engine type increases success chances, allows more payload, and speeds up launch phases.

---

#### 2. **Engine Count** (`engine_count`)
Adds redundancy through multi-engine configurations for safer launches.

| Tier | Upgrade | Cost | Time | Bonuses | Notes |
|------|---------|------|------|---------|-------|
| 1 | Single Engine | Free | — | 0% redundancy | Baseline, risky |
| 2 | Dual Engine | 10k coins + 25 gems | 1.5h | +5% success, +3% redundancy | Built-in backup |
| 3 | Triple Engine | 30k coins + 100 gems | 3h | +10% success, +8% redundancy | High reliability |
| 4 | Quad Engine | 75k coins + 250 gems | 6h | +15% success, +15% redundancy | Maximum safety |

**Philosophy**: More engines = safer launches, but diminishing returns and higher costs. Recommend balancing with Engine Type tree.

---

#### 3. **Reusability** (`reusability`)
**Mechanic Unlock**: Enables 5-phase launches (vs 3-phase) and cost-saving reusability.

| Tier | Upgrade | Cost | Time | Effects | Notes |
|------|---------|------|------|---------|-------|
| 1 | Expendable Rockets | Free | — | 3 phases: Ignition, Ascending, Orbit Injection | Standard |
| 2 | Reusable Rockets | 100k coins + 500 gems | 8h | **5 phases** (+Return, +Landing), 70% cost reduction, 85% reuse chance | Game-changing |

**Philosophy**: Huge endgame unlock that dramatically changes economics. Should be a major milestone.

**Launch Phases Explained**:
- **Phase 1: Ignition** — Rocket engines fire, liftoff
- **Phase 2: Ascending** — Climb to orbit altitude
- **Phase 3: Orbit Injection** — Final burn into target orbit
- **Phase 4: Return** (Reusable only) — De-orbit and descend
- **Phase 5: Landing** (Reusable only) — Precision landing sequence

---

#### 4. **Fuel Efficiency** (`fuel_efficiency`)
Reduces fuel consumption and resource costs across the board.

| Tier | Upgrade | Cost | Time | Bonuses | Notes |
|------|---------|------|------|---------|-------|
| 1 | Standard Fuel | Free | — | 1.0x consumption | Baseline |
| 2 | Optimized Mix | 20k coins + 50 gems | 1.5h | -15% fuel, -10% resource cost | Better chemistry |
| 3 | Advanced Synthesis | 60k coins + 200 gems | 3h | -35% fuel, -25% resource cost | Synthetic/exotic fuels |

**Philosophy**: Synergizes with Engine Type. Nuclear + Advanced Fuel = massive efficiency.

---

#### 5. **Tracking & Navigation** (`tracking_system`)
Improves accuracy and orbit injection success rates.

| Tier | Upgrade | Cost | Time | Bonuses | Notes |
|------|---------|------|------|---------|-------|
| 1 | Basic Tracking | Free | — | 0% accuracy bonus | Manual ground tracking |
| 2 | Automated Tracking | 15k coins + 30 gems | 1.2h | +5% accuracy, +5% orbit injection | Onboard computers |
| 3 | AI Navigation | 50k coins + 150 gems | 2.5h | +15% accuracy, +15% orbit injection | Advanced AI system |

**Philosophy**: Critical for end-game payload precision. Stacks with engine upgrades.

---

### 🏭 FACTORY UPGRADE TREES

#### 1. **Production Speed** (`production_speed`)
Reduces build time for manufactured items.

| Tier | Upgrade | Cost | Time | Effect | Notes |
|------|---------|------|------|--------|-------|
| 1 | Standard Tooling | Free | — | 1.0x build time | Baseline |
| 2 | Advanced Machinery | 15k coins + 40 gems | 1.5h | -20% build time | Modern equipment |
| 3 | Robotic Production | 50k coins + 150 gems | 3h | -50% build time | Fully automated |

**Philosophy**: Stacks with Builder Pads. Tier 3 + Tier 3 Pads = 4 parallel builds at 50% speed = 8x throughput.

---

#### 2. **Builder Pads** (`builder_pads`)
Unlock parallel production slots.

| Tier | Upgrade | Cost | Time | Slots | Notes |
|------|---------|------|------|-------|-------|
| 1 | Single Pad | Free | — | 1 | Baseline |
| 2 | Dual Pads | 20k coins + 50 gems | 2h | 2 | Build 2 items simultaneously |
| 3 | Quad Pads | 60k coins + 200 gems | 4h | 4 | Maximum parallelization |

**Philosophy**: Multiplicative with speed. More valuable as game progresses.

---

#### 3. **Storage Capacity** (`storage_capacity`)
Increases inventory limit for factory items.

| Tier | Upgrade | Cost | Time | Capacity | Notes |
|------|---------|------|------|----------|-------|
| 1 | Small Storage | Free | — | 100 items | Baseline |
| 2 | Medium Storage | 12k coins + 30 gems | 1.2h | 500 items | 5x increase |
| 3 | Large Warehouse | 40k coins + 120 gems | 3h | 2000 items | Late-game bulk |

**Philosophy**: Prevents bottlenecks. Recommend upgrading before expanding production.

---

#### 4. **Quality Control** (`quality_control`)
Reduces defect rate for manufactured items.

| Tier | Upgrade | Cost | Time | Defect Rate | Notes |
|------|---------|------|------|-------------|-------|
| 1 | Basic QC | Free | — | 5% defects | Baseline |
| 2 | Advanced QC | 25k coins + 75 gems | 2h | 1% defects | 80% reduction |

**Philosophy**: Improves profit margins on production. Small late-game upgrade.

---

### ⛏️ MINE UPGRADE TREES

#### 1. **Extraction Rate** (`extraction_rate`)
Increases ore extracted per cycle.

| Tier | Upgrade | Cost | Time | Multiplier | Per-Cycle | Notes |
|------|---------|------|------|------------|-----------|-------|
| 1 | Manual | Free | — | 1.0x | 10 ore | Hand-mining |
| 2 | Powered Tools | 18k coins + 45 gems | 1.5h | 1.25x | 13 ore | +25% extraction |
| 3 | Automated Mining | 55k coins + 180 gems | 3h | 1.7x | 17 ore | +70% extraction |

**Philosophy**: Core mining progression. Higher tiers unlock more resources per cycle.

---

#### 2. **Miner Workforce** (`miner_workforce`)
Deploy additional miners with team synergy bonuses.

| Tier | Upgrade | Cost | Time | Miners | Synergy | Notes |
|------|---------|------|------|--------|---------|-------|
| 1 | Single | Free | — | 1 | 0% | Solo miner |
| 2 | Work Team | 25k coins + 60 gems | 2h | 3 | +5% | Team efficiency |
| 3 | Full Crew | 70k coins + 200 gems | 4h | 6 | +12% | High synergy |

**Philosophy**: Growing workforce with scaling bonuses. Team synergy encourages larger teams.

---

#### 3. **Resource Type Unlock** (`resource_type_unlock`)
Unlock ability to mine different resource types with higher values.

| Tier | Upgrade | Cost | Time | Resources | Value | Notes |
|------|---------|------|------|-----------|-------|-------|
| 1 | Iron Ore | Free | — | Iron | Baseline | Starting resource |
| 2 | Precious Metals | 30k coins + 75 gems | 2.25h | +Copper, Gold | +20% | More valuable |
| 3 | Rare Earth | 100k coins + 300 gems | 4.5h | +Rare Earth, Platinum | +50% | Endgame riches |

**Philosophy**: Progression that incentivizes deeper mining. Late tiers drastically improve resource value.

---

#### 4. **Safety Systems** (`safety_systems`)
Protect miners from loss and mine collapses.

| Tier | Upgrade | Cost | Time | Miner Loss | Collapse | Notes |
|------|---------|------|------|------------|----------|-------|
| 1 | Basic | Free | — | 2% per cycle | 10% risk | Risky operations |
| 2 | Advanced | 20k coins + 50 gems | 1.75h | 0.2% per cycle | 1% risk | Professional safety |

**Philosophy**: Optional but recommended. Safety → lower long-term costs. Insurance against workforce loss.

---

### ⚡ ENERGY GENERATOR UPGRADE TREES

#### 1. **Power Output** (`power_output`)
Increases MW capacity and energy per cycle.

| Tier | Upgrade | Cost | Time | MW | Energy/Cycle | Notes |
|------|---------|------|------|----|----|-------|
| 1 | Basic | Free | — | 10 MW | 10 units | Baseline |
| 2 | Enhanced | 22k coins + 55 gems | 1.75h | 13 MW | 13 units | +30% output |
| 3 | Advanced Reactor | 65k coins + 200 gems | 3.5h | 18 MW | 18 units | +80% output |

**Philosophy**: Scaling power production. Higher tiers support larger mining/factory operations.

---

#### 2. **Fuel Type** (`fuel_type`)
Switch fuel sources with different efficiency/cost/pollution tradeoffs.

| Tier | Upgrade | Cost | Time | Fuel | Efficiency | Cost/Unit | Pollution | Notes |
|------|---------|------|------|------|------------|-----------|-----------|-------|
| 1 | Coal | Free | — | Coal | 60% | 1.0 | High (10) | Cheap, dirty |
| 2 | Solar | 35k coins + 100 gems | 2.5h | Solar | 25% | 0.1 | Zero | Weather-dependent |
| 3 | Nuclear | 120k coins + 350 gems | 5h | Nuclear | 92% | 0.05 | Zero | Max efficiency, needs safety |

**Philosophy**: Strategic choice based on playstyle. Nuclear + Safety Containment = endgame powerhouse.

---

#### 3. **Efficiency Systems** (`efficiency_systems`)
Reduce power loss and waste heat (mostly relevant for nuclear).

| Tier | Upgrade | Cost | Time | Power Loss | Waste Heat | Notes |
|------|---------|------|------|------------|------------|-------|
| 1 | Basic | Free | — | 15% loss | 1.0x | Standard loss |
| 2 | Advanced Recovery | 28k coins + 80 gems | 2h | 5% loss | 0.4x | Waste heat recovery |

**Philosophy**: Synergizes with Power Output. Tier 2 + Tier 3 Power = true endgame setup.

---

#### 4. **Energy Storage** (`storage_batteries`)
Store excess power for peak demand.

| Tier | Upgrade | Cost | Time | Capacity (MWh) | Efficiency | Notes |
|------|---------|------|------|----------------|------------|-------|
| 1 | No Storage | Free | — | 0 | — | Baseline |
| 2 | Small Bank | 20k coins + 50 gems | 1.5h | 100 MWh | 85% | Peak demand buffer |
| 3 | Large Bank | 60k coins + 180 gems | 3h | 500 MWh | 95% | Massive storage |

**Philosophy**: Late-game convenience. Enables 24h operation without continuous generation.

---

#### 5. **Safety & Containment** (`safety_containment`)
Essential for nuclear reactor safety (strongly recommended if using nuclear fuel).

| Tier | Upgrade | Cost | Time | Failure Risk | Leak Risk | Notes |
|------|---------|------|------|--------------|-----------|-------|
| 1 | Basic | Free | — | 0% reduction | 5% leak | Minimal protection |
| 2 | Full Containment | 45k coins + 150 gems | 3.5h | 95% reduction | 0.1% leak | Recommended for nuclear |

**Philosophy**: Must-have with nuclear. Without it, catastrophic failures possible.

---

## Integration Examples

### Launch Site: Balanced Tier 3 Build

```
Engine Type: Nuclear (Tier 2) → Ion (Tier 3)
  Result: +15% success, +35% payload, +40% speed

Engine Count: Dual (Tier 2) → Quad (Tier 3)
  Result: +15% redundancy, +15% success bonus

Reusability: Expendable (Tier 1) → Reusable (Tier 2)
  Result: 5 phases, 70% cost savings, 85% reuse

Fuel Efficiency: Standard (Tier 1) → Advanced (Tier 3)
  Result: -35% fuel, -25% resource cost

Tracking: Basic (Tier 1) → AI (Tier 3)
  Result: +15% accuracy, +15% orbit injection

CUMULATIVE EFFECT:
- Launch Success: ~70-80%
- Payload: +35% capacity
- Cost per launch: -70% (reusability) × -25% (fuel)
- Can reuse 85% of rockets
```

### Factory: Mass Production Build

```
Production Speed: Standard → Robotic (Tier 3)
  Result: -50% build time

Builder Pads: Single → Quad (Tier 3)
  Result: 4 parallel builds

Storage: Small → Large (Tier 3)
  Result: 2000 item capacity

Quality Control: Basic → Advanced (Tier 2)
  Result: 80% fewer defects

CUMULATIVE EFFECT:
- 4 items building in parallel
- Each item takes 50% less time
- Net: 8x faster throughput than baseline
- Storage prevents bottlenecks
- Low defect rate = high profit
```

---

## Usage in Code

### Get Available Upgrades for a Facility

```typescript
import UpgradeService from "@/services/upgrades/UpgradeService";

const trees = UpgradeService.getUpgradeTreesForFacility("launchSite");
// Returns: { ENGINE_TYPE, ENGINE_COUNT, REUSABILITY, FUEL_EFFICIENCY, TRACKING_SYSTEM }
```

### Check Player's Current Bonuses

```typescript
const playerProgress: UserUpgradeProgress = {
  facilityType: "factory",
  facilityId: "factory_1",
  userId: "user_123",
  treeProgress: {
    production_speed: 3,  // Tier 3 = -50% build time
    builder_pads: 2,      // Tier 2 = 2 pads
  },
  completedUpgrades: new Set(["prod_standard", "prod_advanced", "prod_robotic", "pads_1", "pads_2"]),
};

const bonuses = UpgradeService.calculateFacilityBonuses("factory", playerProgress);
// Returns: { buildSpeedBonus: 50, buildTimeMultiplier: 0.5, padCount: 2, ... }
```

### Apply Bonuses to Mechanics

```typescript
// In factory build calculation
const baseBuildTime = 3600000; // 1 hour
const bonuses = UpgradeService.calculateFacilityBonuses("factory", playerProgress);
const actualBuildTime = baseBuildTime * bonuses.buildTimeMultiplier; // 1800000 = 30 mins
```

### Purchase an Upgrade

```typescript
const result = await UpgradeService.purchaseUpgrade(
  "launchSite",
  "launch_site_1",
  "user_123",
  "engine_type",  // treeId
  15000,          // userCoins
  100,            // userGems
  playerProgress,
  playerProgress.completedUpgrades
);

// Result: { success: true, upgradeNode, completionTime, remainingCoins, remainingGems }
// TODO: Persist to database via UpgradeDAO
```

---

## Database Schema (TODO)

You'll need to create an `upgrades` table to track user progress:

```sql
CREATE TABLE facility_upgrades (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  facility_type VARCHAR(50) NOT NULL, -- 'launchSite', 'factory', 'mine', 'energyGenerator'
  facility_id VARCHAR(255) NOT NULL,
  tree_id VARCHAR(100) NOT NULL,
  current_tier INT NOT NULL DEFAULT 0,
  upgrade_in_progress VARCHAR(255), -- upgrade_id of current upgrade
  upgrade_started_at TIMESTAMP,
  upgrade_completes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, facility_id, tree_id)
);

CREATE TABLE completed_upgrades (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  upgrade_id VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, upgrade_id)
);
```

---

## Next Steps

1. **Create UpgradeDAO** for database persistence
2. **Create UpgradeController** for API endpoints
3. **Add routes** to Express app:
   ```typescript
   app.use("/api/v1/upgrades", upgradeRoutes);
   ```
4. **Integrate with facility services** (LaunchSiteService, FactoryService, etc.)
   - Apply bonuses when calculating launch success, build time, mining yield
5. **Add WebSocket updates** for real-time upgrade timer progress
6. **Create frontend UI** for upgrade tree visualization and purchasing

---

## Design Philosophy Notes

### Why Trees, Not Linear?

Trees offer **meaningful strategic choices**. A player can:
- Go deep on engines (Ion + Quad) for max launch capability
- Spread across trees (good engines, good tracking, good fuel) for balanced capability
- Specialize (all batteries for storage, all safety for nuclear) for niche strategies

### Why Cumulative Bonuses?

Cumulative effects make progression feel rewarding and compound in interesting ways:
- Tier 2 + Tier 3 bonuses stack → non-linear power growth
- Encourages completing trees for "synergy effects"
- Reduces math complexity (no "tier 3 replaces tier 2")

### Cost Escalation

Costs increase exponentially to:
- Provide goals for mid-game players
- Make late-game upgrades feel like milestones
- Create differential gem/coin sinks (coins for easy upgrades, gems for hard ones)

### Why Prerequisites?

Prerequisites create **dependency chains** that guide players:
- Prevents skipping to endgame upgrades
- Forces exploration of upgrade trees
- Can create interesting bottlenecks (e.g., "I need better tracking before this payoff")

---

Generated: 2025-06-23 | System: Land of Landless Game Server
