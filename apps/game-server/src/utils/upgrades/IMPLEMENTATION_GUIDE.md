# Upgrade System Implementation Guide

## Quick Start

The upgrade system has been fully implemented and is ready for integration with your game logic. All files are in `src/utils/upgrades/`.

### Files Created

```
src/utils/upgrades/
├── types.ts                 # Type definitions
├── launchSiteUpgrades.ts    # Launch site upgrade trees
├── factoryUpgrades.ts       # Factory upgrade trees
├── upgradeUtils.ts          # Utility functions
├── index.ts                 # Main exports
├── README.md                # Full documentation
├── TREE_STRUCTURE.md        # Visual diagrams
└── IMPLEMENTATION_GUIDE.md  # This file
```

## Key Features

### ✅ Complete Engine Progression
- **Chemical → Ion → Nuclear → Plasma**
- Ion provides +10% fuel efficiency bonus
- Nuclear adds +25% thrust, +20% efficiency
- Plasma offers +35% efficiency, +50% thrust
- Cost and difficulty scale appropriately

### ✅ Engine Count System
- Build rockets with 1-4 engines
- Dual/Triple/Quad setups provide thrust and payload bonuses
- Progressive unlock requirements

### ✅ Rocket Reusability
- **Base Recovery Tech**: 50% chance to recover rocket
- **Enhanced**: +25% recovery improvement
- **Advanced**: +40% recovery improvement
- Unlocks 2 additional launch phases (Return, Landing)

### ✅ Landing Systems
- **Basic Landing**: Enables Return/Landing phases
- **Precision Landing**: +15% fuel efficiency for landing
- **Autonomous Landing**: +25% efficiency, +15% recovery bonus

### ✅ Efficiency Upgrades
- Fuel optimization (-3% phase duration)
- Payload optimization (+200kg capacity)
- Reliability systems (+15% launch success, stackable)

### ✅ Factory Upgrades
- **Production Speed**: +5% to +15% per level
- **Capacity Expansion**: +1 to +6 total builder pads
- **Resource Efficiency**: -5% to -15% costs
- **Quality Control**: +5% to +15% launch success
- **Automation**: +8% to +12% speed boost

### ✅ Launch Phases
```
Non-Reusable: ignition → ascending → orbit_injection
Reusable:     ignition → ascending → orbit_injection → return → landing
```

## Integration Points

### 1. Database Schema

Your existing JSONB columns in `labs` table are ready:
```typescript
launch_site_upgrade_tree: Map<upgradeId, number>
factory_upgrade_tree: Map<upgradeId, number>
```

Suggested data structure:
```typescript
interface UpgradeProgress {
  [upgradeId: string]: {
    level: number;
    completedAt?: Date;
    inProgressSince?: Date;
    nextCompletionTime?: Date;
  }
}
```

### 2. Launch Logic

When launching a rocket, use utility functions:

```typescript
import {
  calculateLaunchSuccessChance,
  calculatePayloadCapacity,
  getLaunchPhases,
  isEngineTypeUnlocked,
  LAUNCH_SITE_UPGRADE_TREE
} from '../utils/upgrades';

// Get available phases for this rocket type
const phases = getLaunchPhases(rocketIsReusable);

// Calculate launch success
const successChance = calculateLaunchSuccessChance(
  baseLaunchChance,
  userCompletedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);

// Check payload capacity
const maxPayload = calculatePayloadCapacity(
  basePayload,
  userCompletedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);

// Validate engine type is available
if (!isEngineTypeUnlocked('ion', userCompletedUpgrades, LAUNCH_SITE_UPGRADE_TREE)) {
  throw new Error('Ion engine not unlocked');
}
```

### 3. Factory Production Logic

```typescript
import {
  calculateUpgradeDuration,
  getApplicableBonuses,
  FACTORY_UPGRADE_TREE
} from '../utils/upgrades';

// Calculate actual production time
const baseBuildTime = 3600; // 1 hour
const bonuses = getApplicableBonuses(
  userCompletedUpgrades,
  FACTORY_UPGRADE_TREE,
  'build_speed'
);

let finalTime = baseBuildTime;
for (const bonus of bonuses) {
  if (bonus.isPercentage) {
    finalTime *= (1 - bonus.value / 100);
  }
}
```

### 4. Upgrade Research Endpoint

Create an API endpoint to start research:

```typescript
// POST /api/lab/upgrades/start
async function startUpgradeResearch(
  userId: string,
  upgradeId: string,
  targetLevel: number
) {
  const lab = await getLabByUserId(userId);
  const completedUpgrades = new Map(
    Object.entries(lab.launch_site_upgrade_tree)
  );
  
  // Check if upgrade can start
  const { canStart, reason } = canUpgradeBeStarted(
    upgradeId,
    LAUNCH_SITE_UPGRADE_TREE,
    lab.level,
    0, // tech level from somewhere
    completedUpgrades
  );
  
  if (!canStart) {
    return { success: false, error: reason };
  }
  
  // Check resources
  const upgrade = LAUNCH_SITE_UPGRADE_TREE[upgradeId];
  const cost = calculateUpgradeCost(upgrade, completedUpgrades.get(upgradeId) ?? 0, targetLevel);
  
  // Deduct resources, set timer, update database
  const duration = calculateUpgradeDuration(upgrade, completedUpgrades.get(upgradeId) ?? 0, targetLevel);
  const completionTime = new Date(Date.now() + duration * 1000);
  
  // Update lab record
  await updateLab(userId, {
    launch_site_upgrade_tree: {
      ...lab.launch_site_upgrade_tree,
      [upgradeId]: {
        level: targetLevel,
        inProgressSince: new Date(),
        nextCompletionTime: completionTime
      }
    }
  });
  
  return { success: true, completionTime };
}
```

### 5. Get Available Upgrades Endpoint

```typescript
// GET /api/lab/upgrades/available
async function getAvailableUpgrades(userId: string) {
  const lab = await getLabByUserId(userId);
  const completedUpgrades = new Map(Object.entries(lab.launch_site_upgrade_tree));
  
  const available = getRecommendedUpgrades(
    completedUpgrades,
    LAUNCH_SITE_UPGRADE_TREE,
    lab.level
  );
  
  return available.map(upgrade => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    requirements: upgrade.requirements,
    cost: upgrade.cost,
    duration: upgrade.duration,
    bonuses: upgrade.bonuses
  }));
}
```

## Usage Examples

### Example 1: Complete Upgrade Path

```typescript
// User completes full engine upgrade path
const path = getUpgradePath('engine_nuclear_base', LAUNCH_SITE_UPGRADE_TREE);
// Returns: ['engine_chemical_base', 'engine_ion_base', 'engine_nuclear_base']

// Estimate total time
const totalTime = estimateBranchCompletionTime(path, LAUNCH_SITE_UPGRADE_TREE);
// Returns total seconds needed for complete path
```

### Example 2: What Does This Unlock?

```typescript
const { nextUpgrades, unlockedFeatures } = getUpgradeUnlocks(
  'reusability_basic',
  LAUNCH_SITE_UPGRADE_TREE
);

console.log(unlockedFeatures);
// ['Unlocks Return phase for rocket recovery', 'Unlocks Landing phase']
```

### Example 3: Calculate Composite Bonuses

```typescript
// Player has multiple upgrades
const completedUpgrades = new Map([
  ['engine_ion_base', 1],
  ['efficiency_reliability', 3],
  ['efficiency_payload', 2]
]);

// Get all success bonuses
const bonuses = getApplicableBonuses(
  completedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE,
  'launch_success_chance'
);

// bonuses = [
//   { value: 8, description: 'Ion Engine (Level 1)' },
//   { value: 45, description: 'Reliability Systems (Level 3)' },
//   { value: 6, description: 'Payload Optimization (Level 2)' }
// ]

const totalBonus = bonuses.reduce((sum, b) => sum + b.value, 0); // 59%
```

### Example 4: Validate User Upgrade State

```typescript
const { valid, errors } = validateUpgradeState(
  userCompletedUpgrades,
  LAUNCH_SITE_UPGRADE_TREE
);

if (!valid) {
  console.error('Invalid upgrade state:', errors);
  // errors = [
  //   "Upgrade engine_ion_base requires parent engine_chemical_base to be completed",
  //   ...
  // ]
}
```

## Customization

### Adding New Engine Type

1. Add to `EngineType` in `types.ts`:
```typescript
export type EngineType = 'chemical' | 'ion' | 'nuclear' | 'plasma' | 'antimatter';
```

2. Add upgrade in `launchSiteUpgrades.ts`:
```typescript
'engine_antimatter_base': {
  id: 'engine_antimatter_base',
  name: 'Antimatter Engine',
  // ... rest of definition
  engineType: 'antimatter',
  // ...
}
```

### Adding New Bonus Type

1. Add to `UpgradeBonusType` in `types.ts`:
```typescript
export type UpgradeBonusType = 
  | 'launch_success_chance'
  | 'payload_capacity'
  | 'fuel_efficiency'
  | 'thermal_resistance'; // NEW
```

2. Create calculation function in `upgradeUtils.ts`:
```typescript
export function calculateThermalResistance(
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): number {
  // Implementation
}
```

### Adjusting Bonus Values

All bonus values are in the upgrade definitions. To rebalance:

```typescript
// In launchSiteUpgrades.ts
'engine_ion_base': {
  // ...
  bonuses: [
    {
      type: 'fuel_efficiency',
      value: 15, // Increased from 10
      isPercentage: true,
    },
    // ...
  ]
}
```

## Testing

### Validate Tree Structure

```typescript
import { validateUpgradeState } from '../utils/upgrades';

// Check for any inconsistencies in the tree
const testMap = new Map([
  ['engine_ion_base', 1],
  ['engine_chemical_base', 1]
]);

const { valid, errors } = validateUpgradeState(testMap, LAUNCH_SITE_UPGRADE_TREE);
if (!valid) {
  console.error('Tree validation failed:', errors);
}
```

### Test Bonus Calculations

```typescript
// Test that bonuses stack correctly
const testUpgrades = new Map([
  ['efficiency_reliability', 1],
  ['efficiency_reliability', 2], // Can't have 2 entries, test as upgraded
  ['engine_chemical_base', 1]
]);

const bonus = calculateLaunchSuccessChance(50, testUpgrades, LAUNCH_SITE_UPGRADE_TREE);
console.assert(bonus > 50, 'Launch success should increase with upgrades');
```

## Performance Considerations

- **Upgrade trees are constants**: No database queries needed to load tree definitions
- **Utility functions are pure**: Safe to call from anywhere without side effects
- **Map lookups are O(1)**: Efficient for checking completed upgrades
- **No circular dependencies**: Tree traversal is guaranteed to terminate

## Next Steps

1. **Integrate with Lab service**: Update lab service to handle upgrade progression
2. **Add API endpoints**: Create routes for checking available upgrades and starting research
3. **Add UI components**: Build UI to display upgrade trees and allow user selection
4. **Add timers**: Implement countdown timers for ongoing research
5. **Add validation**: Run `validateUpgradeState()` on server startup

## Troubleshooting

### "Upgrade not found in tree"
- Check upgrade ID spelling
- Ensure using correct tree (LAUNCH_SITE vs FACTORY)

### "Requires parent to be completed"
- Check parentIds array in upgrade definition
- Verify parent upgrade is actually in the completed upgrades map

### "Bonus not applying"
- Verify bonus type name matches exactly
- Check that upgrade is in completed map with level > 0
- Ensure using correct utility function for that bonus type

## Questions?

Refer to:
- `README.md` - Comprehensive usage documentation
- `TREE_STRUCTURE.md` - Visual diagrams and examples
- `upgradeUtils.ts` - Detailed function implementations
- `launchSiteUpgrades.ts` / `factoryUpgrades.ts` - Specific upgrade definitions
