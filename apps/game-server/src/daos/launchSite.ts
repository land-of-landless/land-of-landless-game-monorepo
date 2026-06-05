import { db } from "./connection.js";
import {
    launchSites,
    satelliteTimers,
    dysonSphereTimers,
} from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for LaunchSite-related operations.
 * Handles database persistence and retrieval for launch site profiles in PostgreSQL.
 */
export default class LaunchSiteDAO {
    /**
     * Creates a new Launch Site profile for a user.
     * @param launchSiteData - The initial launch site data.
     * @returns The created launch site data.
     */
    static async createLaunchSite(launchSiteData: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx.insert(launchSites).values({
                    userId: launchSiteData.userId,
                    level: launchSiteData.level,
                    launchSiteUpgradeTimer: launchSiteData.launch_site_upgrade_timer
                        ? new Date(launchSiteData.launch_site_upgrade_timer)
                        : null,
                    satellitesLaunched: launchSiteData.satellites_launched,
                    wormholesLaunched: launchSiteData.wormholes_launched,
                    astroidDiggersLaunched: launchSiteData.astroid_diggers_launched,
                    cyborgsLaunched: launchSiteData.cyborgs_launched,
                    dysonSpherePartsLaunched: launchSiteData.dyson_sphere_parts_launched,
                });

                if (launchSiteData.satellite_timers?.length > 0) {
                    await tx.insert(satelliteTimers).values(
                        launchSiteData.satellite_timers.map((timer: string) => ({
                            userId: launchSiteData.userId,
                            timer: new Date(timer),
                        })),
                    );
                }

                if (launchSiteData.dyson_sphere_timers?.length > 0) {
                    await tx.insert(dysonSphereTimers).values(
                        launchSiteData.dyson_sphere_timers.map((timer: string) => ({
                            userId: launchSiteData.userId,
                            timer: new Date(timer),
                        })),
                    );
                }

                return launchSiteData;
            });
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.createLaunchSite] Error for userId: ${launchSiteData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create launch site: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a Launch Site profile by user ID.
     * @param userId - The ID of the user.
     * @returns The launch site data if found, otherwise null.
     */
    static async findLaunchSiteByUserId(userId: string) {
        try {
            const res = await db.query.launchSites.findFirst({
                where: (launchSites, { eq }) => eq(launchSites.userId, userId),
                with: {
                    satelliteTimers: true,
                    dysonSphereTimers: true,
                },
            });

            if (!res) return null;

            return {
                userId: res.userId,
                level: res.level,
                launch_site_upgrade_timer: res.launchSiteUpgradeTimer?.toISOString() || "",
                satellites_launched: res.satellitesLaunched,
                satellite_timers: res.satelliteTimers.map((t) => t.timer.toISOString()),
                wormholes_launched: res.wormholesLaunched,
                astroid_diggers_launched: res.astroidDiggersLaunched,
                cyborgs_launched: res.cyborgsLaunched,
                dyson_sphere_parts_launched: res.dysonSpherePartsLaunched,
                dyson_sphere_timers: res.dysonSphereTimers.map((t) =>
                    t.timer.toISOString(),
                ),
            };
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.findLaunchSiteByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find launch site: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves (upserts) a Launch Site profile.
     * @param launchSiteProfile - The launch site profile data to save.
     * @returns The saved launch site data.
     */
    static async saveLaunchSiteProfile(launchSiteProfile: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx
                    .insert(launchSites)
                    .values({
                        userId: launchSiteProfile.userId,
                        level: launchSiteProfile.level,
                        launchSiteUpgradeTimer: launchSiteProfile.launch_site_upgrade_timer
                            ? new Date(launchSiteProfile.launch_site_upgrade_timer)
                            : null,
                        satellitesLaunched: launchSiteProfile.satellites_launched,
                        wormholesLaunched: launchSiteProfile.wormholes_launched,
                        astroidDiggersLaunched: launchSiteProfile.astroid_diggers_launched,
                        cyborgsLaunched: launchSiteProfile.cyborgs_launched,
                        dysonSpherePartsLaunched: launchSiteProfile.dyson_sphere_parts_launched,
                    })
                    .onConflictDoUpdate({
                        target: launchSites.userId,
                        set: {
                            level: launchSiteProfile.level,
                            launchSiteUpgradeTimer: launchSiteProfile.launch_site_upgrade_timer
                                ? new Date(launchSiteProfile.launch_site_upgrade_timer)
                                : null,
                            satellitesLaunched: launchSiteProfile.satellites_launched,
                            wormholesLaunched: launchSiteProfile.wormholes_launched,
                            astroidDiggersLaunched: launchSiteProfile.astroid_diggers_launched,
                            cyborgsLaunched: launchSiteProfile.cyborgs_launched,
                            dysonSpherePartsLaunched: launchSiteProfile.dyson_sphere_parts_launched,
                        },
                    });

                await tx
                    .delete(satelliteTimers)
                    .where(eq(satelliteTimers.userId, launchSiteProfile.userId));
                if (launchSiteProfile.satellite_timers?.length > 0) {
                    await tx.insert(satelliteTimers).values(
                        launchSiteProfile.satellite_timers.map((timer: string) => ({
                            userId: launchSiteProfile.userId,
                            timer: new Date(timer),
                        })),
                    );
                }

                await tx
                    .delete(dysonSphereTimers)
                    .where(eq(dysonSphereTimers.userId, launchSiteProfile.userId));
                if (launchSiteProfile.dyson_sphere_timers?.length > 0) {
                    await tx.insert(dysonSphereTimers).values(
                        launchSiteProfile.dyson_sphere_timers.map((timer: string) => ({
                            userId: launchSiteProfile.userId,
                            timer: new Date(timer),
                        })),
                    );
                }

                return launchSiteProfile;
            });
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.saveLaunchSiteProfile] Error for userId: ${launchSiteProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save launch site: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
