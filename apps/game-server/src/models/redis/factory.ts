import {
    FactoryItem,
    FactoryLevel,
    FactorySecondaryItemIndex,
} from "@/constants/factory";
import { Schema, Entity } from "redis-om";

/**
 * Factory entity interface representing a user's factory state
 * Contains all factory-related data including level, timers, and built items
 */
export interface Factory extends Entity {
    /** Unique identifier for the user who owns this factory */
    userId: string;

    /** Current factory level (0 for initial state) */
    level: FactoryLevel | 0;

    /** Timer for factory upgrade process (ISO string) */
    factory_upgrade_timer: string;

    /** Array of timers for builder pad construction processes */
    builder_pad_building_timers: string[];

    /** Array of items currently being built on builder pads */
    builder_pad_items_being_built: (FactoryItem | "")[];

    /** Array of secondary items being built with their type indices */
    builder_pad_items_being_built_secondary: (
        | FactorySecondaryItemIndex
        | -1
    )[];

    /** Array representing different types/levels of rockets */
    rockets: number;

    /**
     * specifies the type of the rocket for visual scene
     * should be updatable by some methods
     */
    rocket_type: number;

    /** Array representing different types/levels of spaceships */
    spaceships: number[];

    /** Number of explorer units */
    explorers: number;

    /** Number of satellite units */
    satellites: number;

    /** Number of wormhole units */
    wormhole: number;

    /** Number of asteroid digger units */
    astroidDiggers: number;

    /** Number of cyborg units */
    cyborg: number;

    /** Number of Dyson sphere units */
    dysonSphere: number;
}

export const factorySchema = new Schema<Factory>("factory", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default factorySchema;
