import { LAUNCH_SITE_LEVELS_INDEX } from "@/constants/launchSite.js";
import { Schema, Entity } from "redis-om";

/**
 * Represents a user's Launch Site in the game.
 * This entity stores the level of the launch site and tracks the number of various items launched from it.
 */
export interface LaunchSite extends Entity {
    /** The unique identifier of the user who owns this launch site. */
    userId: string;
    /** The current level of the launch site. */
    level: LAUNCH_SITE_LEVELS_INDEX | 0;
    /** A timestamp indicating when the current upgrade will be finished. Empty if no upgrade is in progress. */
    launch_site_upgrade_timer: string;
    /** The total number of satellites launched. */
    satellites_launched: number;
    /** satellite timers */
    satellite_timers: string[];
    /** The total number of wormholes launched. */
    wormholes_launched: number;
    /** The total number of astroid diggers launched. */
    astroid_diggers_launched: number;
    /** The total number of cyborgs launched. */
    cyborgs_launched: number;
    /** The total number of Dyson sphere parts launched. */
    dyson_sphere_parts_launched: number;
    /** dyson_sphere_timers */
    dyson_sphere_timers: string[];
}

/**
 * The Redis OM schema for the LaunchSite entity.
 * Defines the data types and indexing for storing launch site data in Redis.
 */
export const launchSiteSchema = new Schema<LaunchSite>("launchSite", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default launchSiteSchema;
