/**
 * Upgrade System Exports
 * Central point for all upgrade-related functionality
 */

// Type exports
export type {
    UpgradeNode,
    UpgradeRequirement,
    UpgradeCost,
    UpgradeBonus,
    LaunchPhase,
    EngineType,
    RocketReusability,
    LaunchSiteUpgradeTree,
    LaunchSiteUpgradeNode,
    FactoryUpgradeTree,
    FactoryUpgradeNode,
    UpgradeProgress,
    UpgradeTreeMetadata,
    UpgradeTransactionResult,
    AppliedBonus,
    UpgradeBonusType,
} from "./types";

// Launch site upgrades
export {
    LAUNCH_SITE_UPGRADE_TREE,
    LAUNCH_SITE_UPGRADE_CATEGORIES,
} from "./launchSiteUpgrades";

// Factory upgrades
export {
    FACTORY_UPGRADE_TREE,
    FACTORY_UPGRADE_CATEGORIES,
} from "./factoryUpgrades";

// Mine upgrades
export { MINE_UPGRADE_TREE, MINE_UPGRADE_CATEGORIES } from "./mineUpgrades";

// Energy generator upgrades
export {
    ENERGY_GENERATOR_UPGRADE_TREE,
    ENERGY_GENERATOR_UPGRADE_CATEGORIES,
    type GeneratorType,
} from "./energyGeneratorUpgrades";

// Utility functions
export {
    getAncestors,
    getDescendants,
    canUpgradeBeStarted,
    calculateUpgradeCost,
    calculateUpgradeDuration,
    applyBonuses,
    getApplicableBonuses,
    getLaunchPhases,
    isEngineTypeUnlocked,
    getAvailableEngineTypes,
    calculatePayloadCapacity,
    calculateLaunchSuccessChance,
    calculateReusabilityChance,
    calculatePhaseDuration,
    getUpgradePath,
    estimateBranchCompletionTime,
    getUpgradeUnlocks,
    validateUpgradeState,
    getRecommendedUpgrades,
} from "./upgradeUtils";
