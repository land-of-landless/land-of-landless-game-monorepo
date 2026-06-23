/**
 * UPGRADE SERVICE
 * Core business logic for upgrade tree management, application, and progression
 *
 * This service handles:
 * - Unlocking/purchasing upgrades
 * - Calculating cumulative bonuses
 * - Managing upgrade timers
 * - Tracking upgrade completion
 * - Validating prerequisites
 */

import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import {
  LAUNCH_SITE_UPGRADE_TREES,
  FACTORY_UPGRADE_TREES,
  MINE_UPGRADE_TREES,
  ENERGY_GENERATOR_UPGRADE_TREES,
  UpgradeTree,
  UpgradeNode,
  calculateCumulativeEffects,
  calculateUpgradeCost,
  checkPrerequisites,
  getNextUpgrade,
} from "@/constants/upgrades.js";

export interface UserUpgradeProgress {
  facilityType: "launchSite" | "factory" | "mine" | "energyGenerator";
  facilityId: string;
  userId: string;
  treeProgress: Record<string, number>; // treeId -> currentTier
  completedUpgrades: Set<string>; // Set of all completed upgrade IDs
  upgradeInProgress?: {
    upgradeId: string;
    startTime: Date;
    completionTime: Date;
  };
}

export default class UpgradeService {
  /**
   * Get all available upgrade trees for a facility type
   */
  static getUpgradeTreesForFacility(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator"
  ): Record<string, UpgradeTree> {
    switch (facilityType) {
      case "launchSite":
        return LAUNCH_SITE_UPGRADE_TREES as Record<string, UpgradeTree>;
      case "factory":
        return FACTORY_UPGRADE_TREES as Record<string, UpgradeTree>;
      case "mine":
        return MINE_UPGRADE_TREES as Record<string, UpgradeTree>;
      case "energyGenerator":
        return ENERGY_GENERATOR_UPGRADE_TREES as Record<string, UpgradeTree>;
      default:
        throw ERRORS.VALIDATION(`Unknown facility type: ${facilityType}`);
    }
  }

  /**
   * Get specific upgrade tree
   */
  static getUpgradeTree(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    treeId: string
  ): UpgradeTree {
    const trees = this.getUpgradeTreesForFacility(facilityType);
    const tree = Object.values(trees).find(t => t.treeId === treeId);
    if (!tree) {
      throw ERRORS.NOT_FOUND(`Upgrade tree not found: ${treeId}`);
    }
    return tree;
  }

  /**
   * Get next upgrade in a tree for a user
   */
  static getNextAvailableUpgrade(
    tree: UpgradeTree,
    userProgress: UserUpgradeProgress,
    completedUpgrades: Set<string>
  ): UpgradeNode | null {
    const currentTier = userProgress.treeProgress[tree.treeId] || 0;
    const nextUpgrade = getNextUpgrade(tree, currentTier);

    if (!nextUpgrade) return null;

    // Check prerequisites
    if (nextUpgrade.prerequisites && nextUpgrade.prerequisites.length > 0) {
      if (!checkPrerequisites(nextUpgrade.prerequisites, completedUpgrades)) {
        return null; // Prerequisites not met
      }
    }

    return nextUpgrade;
  }

  /**
   * Calculate all current bonuses for a facility
   * Used to apply effects to production/launch calculations
   */
  static calculateFacilityBonuses(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    userProgress: UserUpgradeProgress
  ): Record<string, any> {
    const trees = this.getUpgradeTreesForFacility(facilityType);
    const allBonuses: Record<string, any> = {};

    Object.entries(trees).forEach(([_treeName, tree]) => {
      const treeId = tree.treeId;
      const currentTier = userProgress.treeProgress[treeId] || 0;

      if (currentTier > 0) {
        const bonuses = calculateCumulativeEffects(tree, currentTier);
        // Merge bonuses, with later trees potentially overriding earlier ones
        Object.assign(allBonuses, bonuses);
      }
    });

    return allBonuses;
  }

  /**
   * Apply upgrade and track progress
   * This is where you'd integrate with DAO for persistence
   */
  static async purchaseUpgrade(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    facilityId: string,
    userId: string,
    treeId: string,
    userCoins: number,
    userGems: number,
    userProgress: UserUpgradeProgress,
    completedUpgrades: Set<string>
  ): Promise<{
    success: boolean;
    upgradeNode: UpgradeNode;
    completionTime: Date;
    remainingCoins: number;
    remainingGems: number;
  }> {
    try {
      // Get the tree
      const tree = this.getUpgradeTree(facilityType, treeId);

      // Get next available upgrade
      const nextUpgrade = this.getNextAvailableUpgrade(tree, userProgress, completedUpgrades);
      if (!nextUpgrade) {
        throw ERRORS.VALIDATION("No upgrades available in this tree");
      }

      // Check costs
      if (userCoins < nextUpgrade.costCoins) {
        throw ERRORS.VALIDATION(
          `Insufficient coins. Need ${nextUpgrade.costCoins}, have ${userCoins}`
        );
      }
      if (userGems < nextUpgrade.costGems) {
        throw ERRORS.VALIDATION(
          `Insufficient gems. Need ${nextUpgrade.costGems}, have ${userGems}`
        );
      }

      // Check if upgrade is already in progress
      if (userProgress.upgradeInProgress) {
        throw ERRORS.VALIDATION("Upgrade already in progress for this facility");
      }

      // Calculate completion time
      const now = new Date();
      const completionTime = new Date(now.getTime() + nextUpgrade.upgradeTime);

      // Return what we calculated (DAO will persist)
      return {
        success: true,
        upgradeNode: nextUpgrade,
        completionTime,
        remainingCoins: userCoins - nextUpgrade.costCoins,
        remainingGems: userGems - nextUpgrade.costGems,
      };
    } catch (error) {
      logger.error(
        `[UpgradeService.purchaseUpgrade] Error for userId: ${userId}, facility: ${facilityType}/${facilityId}`,
        { error }
      );
      throw error;
    }
  }

  /**
   * Skip upgrade timer with gems (speed up)
   */
  static async skipUpgradeWithGems(
    userProgress: UserUpgradeProgress,
    userGems: number
  ): Promise<{
    success: boolean;
    gemsRequired: number;
    remainingGems: number;
  }> {
    if (!userProgress.upgradeInProgress) {
      throw ERRORS.VALIDATION("No upgrade in progress");
    }

    const now = new Date();
    const remainingTime = userProgress.upgradeInProgress.completionTime.getTime() - now.getTime();

    // Calculate gem cost: ~1 gem per 10 minutes (600000ms)
    const gemsRequired = Math.ceil(remainingTime / 600000);

    if (userGems < gemsRequired) {
      throw ERRORS.VALIDATION(
        `Insufficient gems. Need ${gemsRequired}, have ${userGems}`
      );
    }

    return {
      success: true,
      gemsRequired,
      remainingGems: userGems - gemsRequired,
    };
  }

  /**
   * Complete an upgrade
   */
  static async completeUpgrade(
    userProgress: UserUpgradeProgress,
    skipWithGem: boolean = false
  ): Promise<{
    success: boolean;
    upgradeId: string;
    treeId: string;
    newTier: number;
  }> {
    if (!userProgress.upgradeInProgress) {
      throw ERRORS.VALIDATION("No upgrade in progress");
    }

    const now = new Date();
    const { upgradeId, completionTime } = userProgress.upgradeInProgress;

    // Check if timer has actually expired (or if skipping)
    if (!skipWithGem && now.getTime() < completionTime.getTime()) {
      throw ERRORS.VALIDATION("Upgrade timer not yet complete");
    }

    // Find which tree this upgrade belongs to and get its treeId
    // This would need to be tracked during purchase, so return it
    const treeId = this.findTreeIdForUpgrade(userProgress.facilityType, upgradeId);

    if (!treeId) {
      throw ERRORS.NOT_FOUND(`Could not find tree for upgrade: ${upgradeId}`);
    }

    const tree = this.getUpgradeTree(userProgress.facilityType, treeId);
    const newTier = (userProgress.treeProgress[treeId] || 0) + 1;

    return {
      success: true,
      upgradeId,
      treeId,
      newTier,
    };
  }

  /**
   * Helper to find tree ID for an upgrade ID
   */
  private static findTreeIdForUpgrade(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    upgradeId: string
  ): string | null {
    const trees = this.getUpgradeTreesForFacility(facilityType);

    for (const tree of Object.values(trees)) {
      for (const upgrade of Object.values(tree.upgrades)) {
        if (upgrade.id === upgradeId) {
          return tree.treeId;
        }
      }
    }

    return null;
  }

  /**
   * Get human-readable upgrade info
   */
  static getUpgradeInfo(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    upgradeId: string
  ): UpgradeNode | null {
    const trees = this.getUpgradeTreesForFacility(facilityType);

    for (const tree of Object.values(trees)) {
      for (const upgrade of Object.values(tree.upgrades)) {
        if (upgrade.id === upgradeId) {
          return upgrade;
        }
      }
    }

    return null;
  }

  /**
   * Get recommended upgrade path for a facility
   * Returns upgrades in suggested order of progression
   */
  static getRecommendedUpgradePath(
    facilityType: "launchSite" | "factory" | "mine" | "energyGenerator",
    currentTier: number = 1
  ): UpgradeNode[] {
    const trees = this.getUpgradeTreesForFacility(facilityType);
    const recommendations: UpgradeNode[] = [];

    // Strategy: Recommend upgrades tier by tier across trees
    // This ensures balanced progression
    for (let tier = 1; tier <= currentTier + 1; tier++) {
      for (const tree of Object.values(trees)) {
        const upgrade = tree.upgrades[tier];
        if (upgrade) {
          recommendations.push(upgrade);
        }
      }
    }

    return recommendations;
  }
}
