/**
 * Upgrade System Type Definitions
 * Defines the structure for upgrade trees across different facilities
 */

// Launch phases based on rocket type
export type LaunchPhase =
  | 'ignition'
  | 'ascending'
  | 'orbit_injection'
  | 'return'
  | 'landing';

// Engine types for launch sites
export type EngineType =
  | 'chemical'
  | 'ion'
  | 'nuclear'
  | 'plasma';

// Rocket reusability status
export type RocketReusability =
  | 'non-reusable'
  | 'reusable';

/**
 * Base structure for any upgrade node
 */
export interface UpgradeNode {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;

  // Requirements for this upgrade
  requirements: UpgradeRequirement[];

  // Cost to perform this upgrade
  cost: UpgradeCost;

  // Time to complete (in seconds)
  duration: number;

  // Parent upgrade IDs that must be completed
  parentIds: string[];

  // Child upgrade IDs that can be unlocked by this
  childIds: string[];

  // Bonuses provided by this upgrade
  bonuses: UpgradeBonus[];
}

/**
 * Requirements for an upgrade
 */
export interface UpgradeRequirement {
  type: 'lab_level' | 'tech_level' | 'upgrade_level' | 'rocket_type';
  value: number | string;
}

/**
 * Cost structure for upgrades
 */
export interface UpgradeCost {
  iron?: number;
  aluminum?: number;
  titanium?: number;
  energy?: number;
  credits?: number;
}

/**
 * Bonuses applied by upgrades (percentage or absolute)
 */
export interface UpgradeBonus {
  type: UpgradeBonusType;
  value: number; // percentage (e.g., 10 = 10%) or absolute value
  isPercentage: boolean;
}

export type UpgradeBonusType =
  | 'launch_success_chance'
  | 'payload_capacity'
  | 'fuel_efficiency'
  | 'build_speed'
  | 'phase_duration' // reduces duration of a specific phase
  | 'engine_thrust'
  | 'reusability_chance'; // chance to recover rocket for reuse

/**
 * Launch Site Upgrade Tree Structure
 */
export interface LaunchSiteUpgradeTree {
  [upgradeId: string]: LaunchSiteUpgradeNode;
}

export interface LaunchSiteUpgradeNode extends UpgradeNode {
  engineType?: EngineType;
  applicablePhases?: LaunchPhase[]; // which phases this affects
  rocketTypeRequired?: 'any' | 'reusable' | 'non-reusable';
}

/**
 * Factory Upgrade Tree Structure
 */
export interface FactoryUpgradeTree {
  [upgradeId: string]: FactoryUpgradeNode;
}

export interface FactoryUpgradeNode extends UpgradeNode {
  applicableItemTypes?: string[]; // which items this affects (e.g., ["rocket_falcon", "rocket_starship"])
}

/**
 * User's upgrade progress tracking
 */
export interface UpgradeProgress {
  upgradeId: string;
  level: number;
  completedAt?: Date;
  inProgressSince?: Date;
  nextCompletionTime?: Date;
}

/**
 * Complete upgrade tree with metadata
 */
export interface UpgradeTreeMetadata {
  totalUpgrades: number;
  totalLevels: number;
  estimatedTimeToComplete: number;
  estimatedCostTotal: UpgradeCost;
}

/**
 * Upgrade transaction result
 */
export interface UpgradeTransactionResult {
  success: boolean;
  message: string;
  nextAvailableUpgrades?: string[];
  appliedBonuses?: AppliedBonus[];
  error?: string;
}

/**
 * Applied bonus from an upgrade
 */
export interface AppliedBonus {
  bonusType: UpgradeBonusType;
  value: number;
  isPercentage: boolean;
  description: string;
}
