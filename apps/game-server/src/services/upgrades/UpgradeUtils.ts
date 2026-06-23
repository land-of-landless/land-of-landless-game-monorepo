/**
 * UPGRADE UTILITIES
 * Helper functions for applying upgrades to game mechanics
 *
 * These utilities show how to integrate upgrade bonuses into actual game calculations
 */

import UpgradeService, { UserUpgradeProgress } from "./UpgradeService.js";

/**
 * ============ LAUNCH SITE UTILITIES ============
 */

export class LaunchSiteUpgradeUtils {
    /**
     * Calculate final launch success chance based on upgrades
     *
     * Example:
     *   Base: 50%
     *   + Engine type: +15%
     *   + Engine count: +15%
     *   + Tracking: +15%
     *   = 95% success chance
     */
    static calculateLaunchSuccessChance(
        baseChance: number,
        userProgress: UserUpgradeProgress
    ): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );

        let successChance = baseChance;

        // Add engine type bonuses
        if (bonuses.launchSuccessBonus) {
            successChance += bonuses.launchSuccessBonus;
        }

        // Add engine count bonuses
        if (bonuses.redundancyBonus) {
            successChance += bonuses.redundancyBonus;
        }

        // Add tracking bonuses
        if (bonuses.accuracyBonus) {
            successChance += bonuses.accuracyBonus;
        }

        // Cap at 99% to avoid guaranteed success
        return Math.min(successChance, 99);
    }

    /**
     * Calculate payload capacity with engine type upgrades
     */
    static calculatePayloadCapacity(
        baseCapacity: number,
        userProgress: UserUpgradeProgress
    ): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );

        if (!bonuses.payloadCapacityBonus) return baseCapacity;

        // Payload bonus is additive: +15% → 1.15x, +35% → 1.35x
        const multiplier = 1 + bonuses.payloadCapacityBonus / 100;
        return Math.floor(baseCapacity * multiplier);
    }

    /**
     * Calculate launch phase count based on reusability upgrades
     */
    static getLaunchPhaseCount(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );
        return bonuses.launchPhases ?? 3; // Default 3 phases if not upgraded
    }

    /**
     * Calculate fuel consumption with efficiency upgrades
     */
    static calculateFuelConsumption(
        baseFuel: number,
        userProgress: UserUpgradeProgress
    ): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );

        if (!bonuses.fuelConsumption) return baseFuel;

        // Fuel multiplier: 0.85 means 15% less fuel needed
        return Math.floor(baseFuel * bonuses.fuelConsumption);
    }

    /**
     * Calculate per-launch cost reduction from reusability
     */
    static calculateCostPerLaunch(
        baseCost: number,
        userProgress: UserUpgradeProgress,
        isReusing: boolean = false
    ): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );

        let finalCost = baseCost;

        // Apply cost per launch multiplier from reusability
        if (bonuses.costPerLaunch && isReusing) {
            finalCost *= bonuses.costPerLaunch; // 0.3 = 70% cost reduction
        }

        // Apply fuel efficiency
        if (bonuses.resourceCost) {
            finalCost *= bonuses.resourceCost; // 0.75 = 25% cost reduction
        }

        return Math.floor(finalCost);
    }

    /**
     * Check if rocket can be reused (requires reusability upgrade)
     */
    static canRocketBeReused(userProgress: UserUpgradeProgress): boolean {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );
        return (bonuses.reuseChance ?? 0) > 0;
    }

    /**
     * Get probability of successful rocket reuse
     */
    static getRocketReuseChance(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "launchSite",
            userProgress
        );
        return bonuses.reuseChance ?? 0;
    }
}

/**
 * ============ FACTORY UTILITIES ============
 */

export class FactoryUpgradeUtils {
    /**
     * Calculate final build time with production speed & builder pad upgrades
     *
     * Example:
     *   Base: 3600000ms (1 hour)
     *   Production Speed Tier 3: -50% = 1800000ms
     *   If building with 4 pads, multiplies throughput by 4x
     */
    static calculateBuildTime(
        baseBuildTime: number,
        userProgress: UserUpgradeProgress
    ): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "factory",
            userProgress
        );

        let buildTime = baseBuildTime;

        // Apply speed multiplier
        if (bonuses.buildTimeMultiplier) {
            buildTime *= bonuses.buildTimeMultiplier;
        }

        return Math.floor(buildTime);
    }

    /**
     * Get number of parallel builder pads available
     */
    static getBuilderPadCount(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "factory",
            userProgress
        );
        return bonuses.padCount ?? 1;
    }

    /**
     * Calculate storage capacity for inventory
     */
    static getStorageCapacity(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "factory",
            userProgress
        );
        return bonuses.storageCapacity ?? 100;
    }

    /**
     * Calculate defect rate for quality control
     */
    static getDefectRate(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "factory",
            userProgress
        );
        // Higher tier = lower defect rate
        return bonuses.defectRate ?? 0.05; // 5% default
    }

    /**
     * Simulate production with all upgrades applied
     *
     * Returns: Items built, defects, time to completion
     */
    static simulateProduction(
        itemsToBuild: number,
        baseBuildTime: number,
        userProgress: UserUpgradeProgress
    ): {
        successfulItems: number;
        defectiveItems: number;
        totalTimeMs: number;
        padsUsed: number;
    } {
        const padCount = this.getBuilderPadCount(userProgress);
        const buildTime = this.calculateBuildTime(baseBuildTime, userProgress);
        const defectRate = this.getDefectRate(userProgress);

        // Calculate how many cycles needed
        const cyclesNeeded = Math.ceil(itemsToBuild / padCount);
        const totalTimeMs = cyclesNeeded * buildTime;

        // Calculate expected defects
        const totalProduced = itemsToBuild;
        const defectiveItems = Math.floor(totalProduced * defectRate);
        const successfulItems = totalProduced - defectiveItems;

        return {
            successfulItems,
            defectiveItems,
            totalTimeMs,
            padsUsed: Math.min(itemsToBuild, padCount),
        };
    }
}

/**
 * ============ MINE UTILITIES ============
 */

export class MineUpgradeUtils {
    /**
     * Calculate ore extracted per mining cycle
     */
    static getResourcePerCycle(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.resourcePerCycle ?? 10;
    }

    /**
     * Get number of active miners
     */
    static getMinerCount(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.minerCount ?? 1;
    }

    /**
     * Calculate team synergy bonus (bonus when workers > 1)
     */
    static getTeamSynergyBonus(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.teamEfficiencyBonus ?? 0;
    }

    /**
     * Get probability of miner loss per cycle (risk factor)
     */
    static getMinerLossRate(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.minerLossRate ?? 0.02; // 2% default
    }

    /**
     * Get probability of mine collapse per cycle
     */
    static getMineCollapseRisk(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.collapseRisk ?? 0.1; // 10% default
    }

    /**
     * Get list of mineable resources based on unlocks
     */
    static getMinableResources(userProgress: UserUpgradeProgress): string[] {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "mine",
            userProgress
        );
        return bonuses.unlockedResources ?? ["iron"];
    }

    /**
     * Simulate mining cycle with risk factors
     */
    static simulateMiningCycle(userProgress: UserUpgradeProgress): {
        resourcesExtracted: number;
        minersLost: number;
        collapsed: boolean;
    } {
        const minerCount = this.getMinerCount(userProgress);
        const synergy = this.getTeamSynergyBonus(userProgress);
        const resourcePerCycle = this.getResourcePerCycle(userProgress);
        const lossRate = this.getMinerLossRate(userProgress);
        const collapseRisk = this.getMineCollapseRisk(userProgress);

        // Calculate resources with team synergy
        const synergyMultiplier = 1 + synergy / 100;
        const baseResources = resourcePerCycle * minerCount * synergyMultiplier;
        const resourcesExtracted = Math.floor(baseResources);

        // Random miner loss
        const minersLost = Math.floor(minerCount * lossRate);

        // Check for collapse
        const collapsed = Math.random() < collapseRisk;

        return {
            resourcesExtracted: collapsed ? 0 : resourcesExtracted,
            minersLost,
            collapsed,
        };
    }
}

/**
 * ============ ENERGY GENERATOR UTILITIES ============
 */

export class EnergyGeneratorUpgradeUtils {
    /**
     * Get power output in MW per generation cycle
     */
    static getPowerOutput(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.megawatts ?? 10;
    }

    /**
     * Get fuel type currently selected
     */
    static getFuelType(
        userProgress: UserUpgradeProgress
    ): "coal" | "solar" | "nuclear" {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.fuelType ?? "coal";
    }

    /**
     * Get efficiency percentage (0.0-1.0)
     */
    static getEfficiency(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.efficiency ?? 0.6;
    }

    /**
     * Get power loss rate (0.0-1.0)
     */
    static getPowerLossRate(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.powerLossRate ?? 0.15;
    }

    /**
     * Get net power available after losses
     */
    static getNetPowerOutput(userProgress: UserUpgradeProgress): number {
        const gross = this.getPowerOutput(userProgress);
        const lossRate = this.getPowerLossRate(userProgress);
        return Math.floor(gross * (1 - lossRate));
    }

    /**
     * Get battery storage capacity in MWh
     */
    static getStorageCapacity(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.storageCapacity ?? 0;
    }

    /**
     * Get radiation/catastrophic failure risk (for nuclear)
     */
    static getFailureRisk(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        const baseRisk = bonuses.radiationLeakRisk ?? 0.05;

        // Failure risk reduction applies multiplicatively
        const riskReduction = bonuses.failureRiskReduction ?? 0;
        return Math.max(0, baseRisk * (1 - riskReduction));
    }

    /**
     * Get cost per fuel unit
     */
    static getCostPerFuelUnit(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.costPerUnit ?? 1.0;
    }

    /**
     * Check if pollution is a factor (coal only)
     */
    static getPollutionLevel(userProgress: UserUpgradeProgress): number {
        const bonuses = UpgradeService.calculateFacilityBonuses(
            "energyGenerator",
            userProgress
        );
        return bonuses.pollutionLevel ?? 0;
    }

    /**
     * Simulate generation cycle
     */
    static simulateGenerationCycle(
        availableFuel: number,
        userProgress: UserUpgradeProgress
    ): {
        energyProduced: number;
        fuelConsumed: number;
        energyStored: number;
        energyUsed: number;
        failed: boolean;
    } {
        const efficiency = this.getEfficiency(userProgress);
        const costPerUnit = this.getCostPerFuelUnit(userProgress);
        const storage = this.getStorageCapacity(userProgress);
        const failureRisk = this.getFailureRisk(userProgress);

        // Check for failure first
        const failed = Math.random() < failureRisk;
        if (failed) {
            return {
                energyProduced: 0,
                fuelConsumed: 0,
                energyStored: 0,
                energyUsed: 0,
                failed: true,
            };
        }

        // Calculate fuel consumption
        const grossPower = this.getPowerOutput(userProgress);
        const fuelNeeded = grossPower / efficiency;
        const fuelConsumed = Math.min(fuelNeeded, availableFuel);

        // Calculate energy produced
        const energyProduced = Math.floor(fuelConsumed * efficiency);

        // Calculate storage
        const energyStored = Math.min(energyProduced, storage);
        const energyUsed = energyProduced - energyStored;

        return {
            energyProduced,
            fuelConsumed,
            energyStored,
            energyUsed,
            failed: false,
        };
    }
}

/**
 * ============ MULTI-FACILITY CALCULATIONS ============
 */

export class CrossFacilityUpgradeUtils {
    /**
     * Calculate total player upgrade investment (for progression tracking)
     */
    static calculateTotalUpgradeInvestment(
        launchSiteProgress: UserUpgradeProgress,
        factoryProgress: UserUpgradeProgress,
        mineProgress: UserUpgradeProgress,
        energyProgress: UserUpgradeProgress
    ): {
        totalCoinsSpent: number;
        totalGemsSpent: number;
        upgradeLevels: {
            launch: number;
            factory: number;
            mining: number;
            energy: number;
        };
    } {
        // Get average tier levels
        const calcAvgTier = (progress: UserUpgradeProgress) => {
            const tiers = Object.values(progress.treeProgress);
            if (tiers.length === 0) return 0;
            return Math.floor(tiers.reduce((a, b) => a + b, 0) / tiers.length);
        };

        return {
            totalCoinsSpent: 0, // Would need DAO to get this
            totalGemsSpent: 0, // Would need DAO to get this
            upgradeLevels: {
                launch: calcAvgTier(launchSiteProgress),
                factory: calcAvgTier(factoryProgress),
                mining: calcAvgTier(mineProgress),
                energy: calcAvgTier(energyProgress),
            },
        };
    }

    /**
     * Get recommended next upgrade across all facilities
     * Useful for UI "what should I upgrade next?" suggestions
     */
    static getRecommendedUpgrades(
        launchSiteProgress: UserUpgradeProgress,
        factoryProgress: UserUpgradeProgress,
        mineProgress: UserUpgradeProgress,
        energyProgress: UserUpgradeProgress
    ) {
        const recommendations = [];

        // Suggest cheap, quick early-game upgrades
        const earlyGameSuggestions = [
            {
                facility: "mine",
                tree: "extraction_rate",
                tier: 1,
                reason: "Double your ore output early",
            },
            {
                facility: "factory",
                tree: "production_speed",
                tier: 1,
                reason: "Speed up rocket production",
            },
            {
                facility: "energyGenerator",
                tree: "power_output",
                tier: 1,
                reason: "Power your factories",
            },
        ];

        // Suggest mid-game multipliers
        const midGameSuggestions = [
            {
                facility: "factory",
                tree: "builder_pads",
                tier: 2,
                reason: "Multiplicative production gains",
            },
            {
                facility: "launchSite",
                tree: "engine_count",
                tier: 2,
                reason: "More reliable launches",
            },
            {
                facility: "mine",
                tree: "miner_workforce",
                tier: 2,
                reason: "Team synergy for mining",
            },
        ];

        // Suggest endgame game-changers
        const endGameSuggestions = [
            {
                facility: "launchSite",
                tree: "reusability",
                tier: 2,
                reason: "Massive cost reduction, game-changer",
            },
            {
                facility: "energyGenerator",
                tree: "fuel_type",
                tier: 3,
                reason: "Nuclear power (with safety)",
            },
        ];

        return {
            earlyGame: earlyGameSuggestions,
            midGame: midGameSuggestions,
            endGame: endGameSuggestions,
        };
    }
}
