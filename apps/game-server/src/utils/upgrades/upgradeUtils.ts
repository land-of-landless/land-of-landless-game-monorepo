/**
 * Upgrade System Utility Functions
 * Provides helper functions for managing upgrade trees, calculations, and validations
 */

import {
  UpgradeNode,
  LaunchSiteUpgradeNode,
  FactoryUpgradeNode,
  UpgradeCost,
  UpgradeBonus,
  LaunchPhase,
  EngineType,
  AppliedBonus,
} from './types';
import { LAUNCH_SITE_UPGRADE_TREE } from './launchSiteUpgrades';

/**
 * Get all ancestors (parents and their parents) of an upgrade
 */
export function getAncestors(
  upgradeId: string,
  tree: Record<string, UpgradeNode>
): string[] {
  const ancestors = new Set<string>();
  const toProcess = [upgradeId];

  while (toProcess.length > 0) {
    const current = toProcess.pop();
    if (!current || !tree[current]) continue;

    const node = tree[current];
    for (const parentId of node.parentIds) {
      if (!ancestors.has(parentId)) {
        ancestors.add(parentId);
        toProcess.push(parentId);
      }
    }
  }

  return Array.from(ancestors);
}

/**
 * Get all descendants (children and their children) of an upgrade
 */
export function getDescendants(
  upgradeId: string,
  tree: Record<string, UpgradeNode>
): string[] {
  const descendants = new Set<string>();
  const toProcess = [upgradeId];

  while (toProcess.length > 0) {
    const current = toProcess.pop();
    if (!current || !tree[current]) continue;

    const node = tree[current];
    for (const childId of node.childIds) {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        toProcess.push(childId);
      }
    }
  }

  return Array.from(descendants);
}

/**
 * Check if an upgrade can be started based on requirements
 */
export function canUpgradeBeStarted(
  upgradeId: string,
  tree: Record<string, UpgradeNode>,
  userLabLevel: number,
  userTechLevel: number,
  completedUpgrades: Map<string, number> // upgradeId -> level completed
): { canStart: boolean; reason?: string } {
  const upgrade = tree[upgradeId];
  if (!upgrade) {
    return { canStart: false, reason: 'Upgrade not found' };
  }

  // Check if all parents are completed
  for (const parentId of upgrade.parentIds) {
    if (!completedUpgrades.has(parentId)) {
      return {
        canStart: false,
        reason: `Requires ${tree[parentId]?.name || parentId} to be completed`,
      };
    }
  }

  // Check requirements
  for (const requirement of upgrade.requirements) {
    if (requirement.type === 'lab_level' && userLabLevel < requirement.value) {
      return {
        canStart: false,
        reason: `Requires Lab Level ${requirement.value}`,
      };
    }

    if (requirement.type === 'tech_level' && userTechLevel < requirement.value) {
      return {
        canStart: false,
        reason: `Requires Tech Level ${requirement.value}`,
      };
    }

    if (requirement.type === 'upgrade_level') {
      // This would require more context about which upgrade
      // Implementation depends on your data structure
    }
  }

  return { canStart: true };
}

/**
 * Calculate total cost for upgrading from current level to target level
 */
export function calculateUpgradeCost(
  upgrade: UpgradeNode,
  fromLevel: number,
  toLevel: number
): UpgradeCost {
  const totalCost: UpgradeCost = {};

  // Simple linear scaling: cost increases with each level
  const baseCost = upgrade.cost;
  const levelMultiplier = toLevel - fromLevel;

  for (const [resource, amount] of Object.entries(baseCost)) {
    if (amount) {
      totalCost[resource as keyof UpgradeCost] = amount * levelMultiplier * (1 + fromLevel * 0.1);
    }
  }

  return totalCost;
}

/**
 * Calculate total time needed to upgrade from current level to target level
 */
export function calculateUpgradeDuration(
  upgrade: UpgradeNode,
  fromLevel: number,
  toLevel: number
): number {
  // Scaling: each level takes progressively longer
  let totalDuration = 0;
  for (let level = fromLevel; level < toLevel; level++) {
    totalDuration += upgrade.duration * (1 + level * 0.15); // 15% increase per level
  }
  return totalDuration;
}

/**
 * Apply all bonuses from an upgrade to a baseline value
 */
export function applyBonuses(
  baseValue: number,
  bonuses: UpgradeBonus[],
  bonusType: string
): number {
  let finalValue = baseValue;
  const applicableBonuses = bonuses.filter(
    (b) => b.type === bonusType
  );

  for (const bonus of applicableBonuses) {
    if (bonus.isPercentage) {
      finalValue *= 1 + bonus.value / 100;
    } else {
      finalValue += bonus.value;
    }
  }

  return finalValue;
}

/**
 * Get all bonuses that apply to a specific bonus type from a set of upgrades
 */
export function getApplicableBonuses(
  completedUpgrades: Map<string, number>, // upgradeId -> level
  tree: Record<string, UpgradeNode>,
  bonusType: string
): AppliedBonus[] {
  const applicableBonuses: AppliedBonus[] = [];

  for (const [upgradeId, level] of completedUpgrades.entries()) {
    const upgrade = tree[upgradeId];
    if (!upgrade) continue;

    for (const bonus of upgrade.bonuses) {
      if (bonus.type === bonusType) {
        applicableBonuses.push({
          bonusType: bonus.type,
          value: bonus.value * level, // Scale by level
          isPercentage: bonus.isPercentage,
          description: `${upgrade.name} (Level ${level})`,
        });
      }
    }
  }

  return applicableBonuses;
}

/**
 * Calculate launch phases available based on rocket type
 */
export function getLaunchPhases(rocketIsReusable: boolean): LaunchPhase[] {
  const basePhases: LaunchPhase[] = [
    'ignition',
    'ascending',
    'orbit_injection',
  ];

  if (rocketIsReusable) {
    return [...basePhases, 'return', 'landing'];
  }

  return basePhases;
}

/**
 * Check if a specific engine type is unlocked
 */
export function isEngineTypeUnlocked(
  engineType: EngineType,
  completedUpgrades: Map<string, number>,
  tree: Record<string, LaunchSiteUpgradeNode>
): boolean {
  for (const [upgradeId, level] of completedUpgrades.entries()) {
    const upgrade = tree[upgradeId] as LaunchSiteUpgradeNode;
    if (upgrade?.engineType === engineType && level > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Get all available engine types
 */
export function getAvailableEngineTypes(
  completedUpgrades: Map<string, number>,
  tree: Record<string, LaunchSiteUpgradeNode>
): EngineType[] {
  const engines: EngineType[] = [];

  for (const [upgradeId, level] of completedUpgrades.entries()) {
    const upgrade = tree[upgradeId] as LaunchSiteUpgradeNode;
    if (upgrade?.engineType && level > 0 && !engines.includes(upgrade.engineType)) {
      engines.push(upgrade.engineType);
    }
  }

  return engines;
}

/**
 * Calculate effective payload capacity
 */
export function calculatePayloadCapacity(
  baseCapacity: number,
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): number {
  let capacity = baseCapacity;

  const bonuses = getApplicableBonuses(
    completedUpgrades,
    tree,
    'payload_capacity'
  );

  for (const bonus of bonuses) {
    if (bonus.isPercentage) {
      capacity *= 1 + bonus.value / 100;
    } else {
      capacity += bonus.value;
    }
  }

  return capacity;
}

/**
 * Calculate effective launch success chance (as percentage 0-100)
 */
export function calculateLaunchSuccessChance(
  baseChance: number,
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): number {
  let chance = baseChance;

  const bonuses = getApplicableBonuses(
    completedUpgrades,
    tree,
    'launch_success_chance'
  );

  for (const bonus of bonuses) {
    if (bonus.isPercentage) {
      chance += bonus.value; // Additive for percentages
    } else {
      chance += bonus.value;
    }
  }

  return Math.min(chance, 100); // Cap at 100%
}

/**
 * Calculate rocket recovery/reusability chance
 */
export function calculateReusabilityChance(
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): number {
  let chance = 0;

  const bonuses = getApplicableBonuses(
    completedUpgrades,
    tree,
    'reusability_chance'
  );

  for (const bonus of bonuses) {
    if (bonus.isPercentage) {
      chance += bonus.value;
    } else {
      chance += bonus.value;
    }
  }

  return Math.min(chance, 100); // Cap at 100%
}

/**
 * Calculate phase duration reduction (for faster launches)
 */
export function calculatePhaseDuration(
  baseDuration: number,
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): number {
  let duration = baseDuration;

  const bonuses = getApplicableBonuses(
    completedUpgrades,
    tree,
    'phase_duration'
  );

  for (const bonus of bonuses) {
    if (bonus.isPercentage) {
      duration *= 1 - bonus.value / 100; // Reduce duration
    } else {
      duration -= bonus.value;
    }
  }

  return Math.max(duration, 1); // Minimum 1 second
}

/**
 * Get the upgrade tree path from root to a specific upgrade
 */
export function getUpgradePath(
  upgradeId: string,
  tree: Record<string, UpgradeNode>
): string[] {
  const path: string[] = [upgradeId];
  let current = upgradeId;

  while (tree[current]?.parentIds.length > 0) {
    const parent = tree[current].parentIds[0]; // Get first parent
    path.unshift(parent);
    current = parent;
  }

  return path;
}

/**
 * Estimate total time to complete all upgrades in a branch
 */
export function estimateBranchCompletionTime(
  upgradeIds: string[],
  tree: Record<string, UpgradeNode>
): number {
  let totalTime = 0;

  for (const id of upgradeIds) {
    const upgrade = tree[id];
    if (upgrade) {
      totalTime += upgrade.duration;
    }
  }

  return totalTime;
}

/**
 * Get summary of what an upgrade unlocks
 */
export function getUpgradeUnlocks(
  upgradeId: string,
  tree: Record<string, UpgradeNode>
): {
  nextUpgrades: UpgradeNode[];
  unlockedFeatures: string[];
} {
  const upgrade = tree[upgradeId];
  if (!upgrade) {
    return { nextUpgrades: [], unlockedFeatures: [] };
  }

  const nextUpgrades = upgrade.childIds
    .map((id) => tree[id])
    .filter(Boolean);

  const unlockedFeatures: string[] = [];

  // Determine what features this unlocks
  if ('engineType' in upgrade) {
    unlockedFeatures.push(`Unlocks ${upgrade.engineType} engine type`);
  }

  if (
    'applicablePhases' in upgrade &&
    upgrade.applicablePhases?.includes('return')
  ) {
    unlockedFeatures.push('Unlocks Return phase for rocket recovery');
  }

  if (
    'applicablePhases' in upgrade &&
    upgrade.applicablePhases?.includes('landing')
  ) {
    unlockedFeatures.push('Unlocks Landing phase');
  }

  return { nextUpgrades, unlockedFeatures };
}

/**
 * Validate a completed upgrade state
 */
export function validateUpgradeState(
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [upgradeId, level] of completedUpgrades.entries()) {
    const upgrade = tree[upgradeId];

    if (!upgrade) {
      errors.push(`Upgrade ${upgradeId} not found in tree`);
      continue;
    }

    if (level > upgrade.maxLevel) {
      errors.push(
        `Upgrade ${upgradeId} level ${level} exceeds max level ${upgrade.maxLevel}`
      );
    }

    // Check parent requirements
    for (const parentId of upgrade.parentIds) {
      if (!completedUpgrades.has(parentId)) {
        errors.push(
          `Upgrade ${upgradeId} requires parent ${parentId} to be completed`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get upgrade recommendations based on user level and completed upgrades
 */
export function getRecommendedUpgrades(
  completedUpgrades: Map<string, number>,
  tree: Record<string, UpgradeNode>,
  userLabLevel: number
): UpgradeNode[] {
  const recommendations: UpgradeNode[] = [];

  for (const [upgradeId, upgrade] of Object.entries(tree)) {
    // Skip if already completed
    if (completedUpgrades.has(upgradeId)) {
      continue;
    }

    // Check if can be started
    const { canStart } = canUpgradeBeStarted(
      upgradeId,
      tree,
      userLabLevel,
      0,
      completedUpgrades
    );

    if (canStart) {
      recommendations.push(upgrade);
    }
  }

  return recommendations;
}
