# Upgrade System Documentation

A comprehensive, tree-based upgrade system for managing technological progression in the Land of Landless game. This system handles engine types, rocket reusability, manufacturing improvements, and more.

## Overview

The upgrade system is organized around **upgrade trees** where each upgrade has:
- **Parent requirements** (must complete before unlocking)
- **Dependencies** (lab level, tech level, etc.)
- **Costs** (iron, aluminum, titanium, energy, credits)
- **Duration** (time to research/implement)
- **Bonuses** (gameplay effects like +5% fuel efficiency)

## Tree Structure

### Launch Site Upgrades (`launchSiteUpgrades.ts`)

The launch site tree is organized into **5 main branches**:

#### 1. **Engine Type Branch** (Chemical → Ion → Nuclear → Plasma)
Progressive engine technology upgrades with increasing efficiency and cost.

- **Chemical Engine** (baseline)
  - +5% launch success
  - 100kg payload capacity
  - 1 hour research

- **Ion Engine** (requires Lab 3)
  - +10% fuel efficiency (bonus over chemical)
  - +8% launch success
  - 150kg payload capacity
  - 2 hours research

- **Nuclear Engine** (requires Lab 6, Tech 3)
  - +20% fuel efficiency
  - +25% engine thrust
  - +12% launch success
  - 300kg payload capacity
  - 4 hours research

- **Plasma Engine** (requires Lab 10, Tech 5)
  - +35% fuel efficiency
  - +50% engine thrust
  - +20% launch success
  - 500kg payload capacity
  - 8 hours research

#### 2. **Engine Count Branch** (1 → 2 → 3 → 4 engines)
Allows building rockets with multiple engines for redundancy and power.

- **Dual Engines** (2 engines)
  - +100 thrust units
  - +5% launch success

- **Triple Engines** (3 engines)
  - +200 thrust units
  - +300kg payload
  - +7% launch success

- **Quad Engines** (4 engines)
  - +400 thrust units
  - +600kg payload
  - +10% launch success

#### 3. **Reusability Branch** (Recovery → Enhanced → Advanced)
Unlock rocket recovery and reuse technology.

- **Rocket Recovery Technology** (requires Lab 5, Tech 2)
  - Unlocks Return and Landing phases
  - 50% chance to recover rocket
  - 5 hours research

- **Enhanced Recovery System** (requires recovery tech + Lab 8)
  - +25% recovery rate improvement
  - 4 hours research

- **Advanced Recovery System** (requires enhanced + Lab 10, Tech 4)
  - +40% recovery rate improvement
  - 6 hours research

#### 4. **Landing System Branch** (Basic → Precision → Autonomous)
Only unlocks if reusability tech is researched. For controlled landing of reusable rockets.

- **Landing System** (requires reusability basic + Lab 6)
  - Enables Return and Landing phases
  - +5% launch success
  - 3 hours research

- **Precision Landing System** (requires landing basic + Lab 8)
  - +15% fuel efficiency during landing
  - +8% launch success
  - 2 hours research

- **Autonomous Landing System** (requires precision + Lab 10, Tech 3)
  - +25% landing fuel efficiency
  - +15% recovery chance
  - +10% launch success
  - 4 hours research

#### 5. **Efficiency Branch** (Fuel → Payload → Reliability)
Independent efficiency improvements.

- **Fuel Optimization**
  - +5% fuel efficiency
  - -3% phase duration
  - 1.5 hours research

- **Payload Optimization** (requires fuel optimization)
  - +200kg payload capacity
  - +3% launch success

- **Reliability Systems**
  - +15% launch success (stacks)
  - 2.5 hours research

### Factory Upgrades (`factoryUpgrades.ts`)

The factory tree is organized into **5 main branches**:

#### 1. **Production Speed Branch** (I → II → III)
Progressive manufacturing speed improvements.

- **Production Optimization I** (Lab 2)
  - +5% build speed

- **Production Optimization II** (Lab 4)
  - +10% build speed

- **Production Optimization III** (Lab 6, Tech 2)
  - +15% build speed

#### 2. **Capacity Branch** (I → II → III)
Add more builder pads for parallel production.

- **Expansion Module I** (Lab 3)
  - +1 builder pad

- **Expansion Module II** (Lab 5)
  - +2 builder pads

- **Mega Factory Expansion** (Lab 8, Tech 2)
  - +3 builder pads

#### 3. **Efficiency Branch** (I → II → III)
Reduce resource costs for manufacturing.

- **Resource Optimization I** (Lab 2)
  - -5% resource costs

- **Resource Optimization II** (Lab 4)
  - -10% resource costs

- **Advanced Manufacturing** (Lab 7, Tech 2)
  - -15% resource costs

#### 4. **Quality Branch** (I → II → III)
Improve rocket quality and launch success.

- **Quality Control I** (Lab 3)
  - +5% launch success

- **Quality Control II** (Lab 5)
  - +10% launch success

- **Precision Manufacturing** (Lab 8, Tech 3)
  - +15% launch success

#### 5. **Automation Branch** (I → II)
Introduce automation for additional speed bonuses.

- **Automated Assembly I** (Lab 5, requires production II)
  - +8% build speed

- **Full Automation** (Lab 9, Tech 3)
  - +12% build speed

## Launch Phases

The game has **5 launch phases** depending on rocket type:

### Non-Reusable Rockets (3 phases)
1. **Ignition** - Engine startup and initial acceleration
2. **Ascending** - Climbing to orbit altitude
3. **Orbit Injection** - Final burn to achieve orbit

### Reusable Rockets (5 phases, requires reusability tech)
1. **Ignition** - Engine startup
2. **Ascending** - Climb to orbit
3. **Orbit Injection** - Achieve orbit
4. **Return** - Deorbit and descent (unlocked by landing tech)
5. **Landing** - Controlled landing (unlocked by landing tech)

## Core Concepts

### Engine Types
- **Chemical**: Baseline, reliable, cost-effective
- **Ion**: More efficient (+10%), more expensive
- **Nuclear**: High thrust, higher efficiency (+20%)
- **Plasma**: Cutting edge, maximum efficiency (+35%)

Each engine type affects game balance differently but follows this pattern:
- **Ion over Chemical**: ~10% bonus to launch success
- **Nuclear over Ion**: ~20% bonus to efficiency + 25% thrust
- **Plasma over Nuclear**: ~35% efficiency + 50% thrust

### Bonus Types
- `launch_success_chance` - Percentage chance for successful launch
- `payload_capacity` - How much weight can be carried (kg or %)
- `fuel_efficiency` - Reduce fuel consumption (%)
- `build_speed` - Accelerate manufacturing (%)
- `phase_duration` - Reduce time for launch phases (%)
- `engine_thrust` - Increase engine power (absolute or %)
- `reusability_chance` - Chance to recover/reuse rocket after launch (%)

## Usage Examples

### Getting Launch Phases
```typescript
import { getLaunchPhases } from './utils/upgrades';

// For non-reusable rockets
const phases = getLaunchPhases(false);
// ['ignition', 'ascending', 'orbit_injection']

// For reusable rockets
const phases = getLaunchPhases(true);
// ['ignition', 'ascending', 'orbit_injection', 'return', 'landing']
```

### Checking if Upgrade is Available
```typescript
import { 
  canUpgradeBeStarted, 
  LAUNCH_SITE_UPGRADE_TREE 
} from './utils/upgrades';

const completedUpgrades = new Map([
  ['engine_chemical_base', 1]
]);

const result = canUpgradeBeStarted(
  'engine_ion_base',
  LAUNCH_SITE_UPGRADE_TREE,
  3, // userLabLevel
  0, // userTechLevel
  completedUpgrades
);

if (result.canStart) {
  console.log('Can start Ion Engine upgrade!');
} else {
  console.log('Cannot start:', result.reason);
  // "Requires Lab Level 3" or "Requires Chemical Engine to be completed"
}
```

### Calculating Launch Success
```typescript
import { 
  calculateLaunchSuccessChance,
  LAUNCH_SITE_UPGRADE_TREE 
} from './utils/upgrades';

const completedUpgrades = new Map([
  ['engine_chemical_base', 1],
  ['efficiency_reliability', 2],
  ['engine_ion_base', 1]
]);

const baseChance = 60; // Base 60% success rate
const finalChance = calculateLaunchSuccessChance(
  baseChance,
  completedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);
// Returns ~85% (with bonuses from upgrades)
```

### Getting Available Engine Types
```typescript
import { 
  getAvailableEngineTypes,
  LAUNCH_SITE_UPGRADE_TREE 
} from './utils/upgrades';

const completedUpgrades = new Map([
  ['engine_chemical_base', 1],
  ['engine_ion_base', 1]
]);

const engines = getAvailableEngineTypes(
  completedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);
// ['chemical', 'ion']
```

### Calculating Effective Payload
```typescript
import { 
  calculatePayloadCapacity,
  LAUNCH_SITE_UPGRADE_TREE 
} from './utils/upgrades';

const completedUpgrades = new Map([
  ['engine_chemical_base', 1],
  ['efficiency_payload', 1],
  ['engine_count_2', 1]
]);

const basePayload = 500; // kg
const effectivePayload = calculatePayloadCapacity(
  basePayload,
  completedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);
// Accounts for all bonuses from upgrades
```

### Getting Upgrade Recommendations
```typescript
import { 
  getRecommendedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE 
} from './utils/upgrades';

const completedUpgrades = new Map([
  ['engine_chemical_base', 1]
]);

const recommendations = getRecommendedUpgrades(
  completedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE,
  5 // userLabLevel
);
// Returns array of upgrades that can be started now
```

## Database Integration

The upgrade progress is stored in the `launch_site_upgrade_tree` JSONB column in PostgreSQL:

```typescript
interface LaunchSiteUpgradeProgress {
  [upgradeId: string]: {
    level: number;
    completedAt?: Date;
    inProgressSince?: Date;
    nextCompletionTime?: Date;
  }
}
```

Example usage in database queries:
```typescript
// Get user's completed upgrades
const upgrades = lab.launch_site_upgrade_tree;

// Convert to Map for utility functions
const completedMap = new Map(Object.entries(upgrades));

// Check if ion engine is unlocked
const ionUnlocked = completedMap.get('engine_ion_base') ?? 0 > 0;
```

## Future Extensions

This upgrade system is extensible for:
- **Mining upgrades** - Ore extraction rates, new materials
- **Energy generator upgrades** - Power generation efficiency
- **General upgrades** - Lab improvements, storage capacity
- **Portal upgrades** - Teleportation technology
- **Minigame tech** - Gameplay mechanics improvements

Simply create new upgrade tree files following the same pattern as `launchSiteUpgrades.ts` and `factoryUpgrades.ts`.

## Design Decisions

1. **Tree Structure**: Each upgrade has explicit parent/child relationships for clear progression paths
2. **Layered Bonuses**: Multiple upgrades can contribute bonuses that stack additively
3. **Level Scaling**: Costs and durations increase with level to prevent rapid completion
4. **Requirements**: Both lab level and tech level requirements ensure meaningful progression
5. **Percentage vs Absolute**: Bonuses can be percentage-based or absolute values depending on context
6. **Phase Unlocking**: Reusability and landing systems are optional, unlocking new gameplay

## Performance Notes

- Upgrade trees are static, loaded at startup
- Utility functions are pure (no side effects)
- Use Maps for O(1) lookup of completed upgrades
- Tree validation can be run at server startup to catch data issues
