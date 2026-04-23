import logger from "./logger.ts";

/**
 * Configuration interface for XP calculation parameters
 */
interface XpConfig {
    baseXp: number;
    linearIncrement: number;
    exponentialIncrement: number;
}

/**
 * Calculates the XP required for a specific level using a quadratic formula
 * @param level - The level to calculate XP for (must be positive)
 * @param baseXp - Base XP amount
 * @param linearIncrement - Linear increment per level
 * @param exponentialIncrement - Exponential increment per level squared
 * @returns The XP required for the specified level
 */
export function calculateXp(
    level: number,
    baseXp: number,
    linearIncrement: number,
    exponentialIncrement: number,
): number {
    if (level <= 0) {
        throw new Error("Level must be a positive number");
    }

    return baseXp + linearIncrement * level + exponentialIncrement * level ** 2;
}

/**
 * Calculates the total XP required to reach a maximum level
 * @param baseXp - Base XP amount
 * @param linearIncrement - Linear increment per level
 * @param exponentialIncrement - Exponential increment per level squared
 * @param maxLevel - Maximum level to calculate total XP for (default: 50)
 * @returns The total XP required to reach the maximum level
 */
export function calculateTotalXp(
    baseXp: number,
    linearIncrement: number,
    exponentialIncrement: number,
    maxLevel: number = 50,
): number {
    let totalXp = 0;

    for (let level = 1; level <= maxLevel; level++) {
        totalXp += calculateXp(
            level,
            baseXp,
            linearIncrement,
            exponentialIncrement,
        );
    }

    return totalXp;
}

// Experiment with these values!  Start higher since we need more total XP
let base_xp = 100;
let linear_increment = 50;
let exponential_increment = 5;
const targetTotalXp = 100000; // For 20 days

let total_xp = calculateTotalXp(
    base_xp,
    linear_increment,
    exponential_increment,
);

while (total_xp > targetTotalXp) {
    if (exponential_increment > 0) {
        exponential_increment -= 0.1;
    } else if (linear_increment > 0) {
        linear_increment -= 1;
    } else if (base_xp > 0) {
        base_xp -= 1;
    }
    total_xp = calculateTotalXp(
        base_xp,
        linear_increment,
        exponential_increment,
    );
}

logger.debug("XP calculation debug", {
    baseXp: base_xp,
    linearIncrement: linear_increment,
    exponentialIncrement: exponential_increment,
    totalXp: total_xp,
});

let xps_for_levels = [];
let sum = 0;
for (let level = 1; level <= 50; level++) {
    const xp = Math.floor(
        calculateXp(level, base_xp, linear_increment, exponential_increment),
    );

    sum += xp;

    xps_for_levels.push(sum);

    logger.debug(`Level ${level}: ${sum} XP`);
}

logger.debug("XP levels calculated", { xpsForLevels: xps_for_levels });
