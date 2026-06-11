import { db } from "./connection.js";
import {
    launchSites,
    satelliteTimers,
    dysonSphereTimers,
} from "@/models/postgres/schema.js";
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
            return await db.transaction(async tx => {
                await tx.insert(launchSites).values({
                    user_id: launchSiteData.userId,
                    level: launchSiteData.level,
                    launch_site_upgrade_timer:
                        launchSiteData.launch_site_upgrade_timer
                            ? new Date(launchSiteData.launch_site_upgrade_timer)
                            : null,
                    satellites_launched: launchSiteData.satellites_launched,
                    wormholes_launched: launchSiteData.wormholes_launched,
                    astroid_diggers_launched:
                        launchSiteData.astroid_diggers_launched,
                    cyborgs_launched: launchSiteData.cyborgs_launched,
                    dyson_sphere_parts_launched:
                        launchSiteData.dyson_sphere_parts_launched,
                });

                if (launchSiteData.satellite_timers?.length > 0) {
                    await tx.insert(satelliteTimers).values(
                        launchSiteData.satellite_timers.map(
                            (timer: string) => ({
                                user_id: launchSiteData.userId,
                                timer: new Date(timer),
                            })
                        )
                    );
                }

                if (launchSiteData.dyson_sphere_timers?.length > 0) {
                    await tx.insert(dysonSphereTimers).values(
                        launchSiteData.dyson_sphere_timers.map(
                            (timer: string) => ({
                                user_id: launchSiteData.userId,
                                timer: new Date(timer),
                            })
                        )
                    );
                }

                return launchSiteData;
            });
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.createLaunchSite] Error for userId: ${launchSiteData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create launch site: ${error instanceof Error ? error.message : "Unknown error"}`
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
                where: (launchSites, { eq }) => eq(launchSites.user_id, userId),
                with: {
                    satelliteTimers: true,
                    dysonSphereTimers: true,
                },
            });

            if (!res) return null;

            return {
                userId: res.user_id,
                level: res.level,
                launch_site_upgrade_timer:
                    res.launch_site_upgrade_timer?.toISOString() || "",
                satellites_launched: res.satellites_launched,
                satellite_timers: res.satelliteTimers.map(t =>
                    t.timer.toISOString()
                ),
                wormholes_launched: res.wormholes_launched,
                astroid_diggers_launched: res.astroid_diggers_launched,
                cyborgs_launched: res.cyborgs_launched,
                dyson_sphere_parts_launched: res.dyson_sphere_parts_launched,
                dyson_sphere_timers: res.dysonSphereTimers.map(t =>
                    t.timer.toISOString()
                ),
            };
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.findLaunchSiteByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find launch site: ${error instanceof Error ? error.message : "Unknown error"}`
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
            return await db.transaction(async tx => {
                await tx
                    .insert(launchSites)
                    .values({
                        user_id: launchSiteProfile.userId,
                        level: launchSiteProfile.level,
                        launch_site_upgrade_timer:
                            launchSiteProfile.launch_site_upgrade_timer
                                ? new Date(
                                      launchSiteProfile.launch_site_upgrade_timer
                                  )
                                : null,
                        satellites_launched:
                            launchSiteProfile.satellites_launched,
                        wormholes_launched:
                            launchSiteProfile.wormholes_launched,
                        astroid_diggers_launched:
                            launchSiteProfile.astroid_diggers_launched,
                        cyborgs_launched: launchSiteProfile.cyborgs_launched,
                        dyson_sphere_parts_launched:
                            launchSiteProfile.dyson_sphere_parts_launched,
                    })
                    .onConflictDoUpdate({
                        target: launchSites.user_id,
                        set: {
                            level: launchSiteProfile.level,
                            launch_site_upgrade_timer:
                                launchSiteProfile.launch_site_upgrade_timer
                                    ? new Date(
                                          launchSiteProfile.launch_site_upgrade_timer
                                      )
                                    : null,
                            satellites_launched:
                                launchSiteProfile.satellites_launched,
                            wormholes_launched:
                                launchSiteProfile.wormholes_launched,
                            astroid_diggers_launched:
                                launchSiteProfile.astroid_diggers_launched,
                            cyborgs_launched:
                                launchSiteProfile.cyborgs_launched,
                            dyson_sphere_parts_launched:
                                launchSiteProfile.dyson_sphere_parts_launched,
                        },
                    });

                await tx
                    .delete(satelliteTimers)
                    .where(
                        eq(satelliteTimers.user_id, launchSiteProfile.userId)
                    );
                if (launchSiteProfile.satellite_timers?.length > 0) {
                    await tx.insert(satelliteTimers).values(
                        launchSiteProfile.satellite_timers.map(
                            (timer: string) => ({
                                user_id: launchSiteProfile.userId,
                                timer: new Date(timer),
                            })
                        )
                    );
                }

                await tx
                    .delete(dysonSphereTimers)
                    .where(
                        eq(dysonSphereTimers.user_id, launchSiteProfile.userId)
                    );
                if (launchSiteProfile.dyson_sphere_timers?.length > 0) {
                    await tx.insert(dysonSphereTimers).values(
                        launchSiteProfile.dyson_sphere_timers.map(
                            (timer: string) => ({
                                user_id: launchSiteProfile.userId,
                                timer: new Date(timer),
                            })
                        )
                    );
                }

                return launchSiteProfile;
            });
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.saveLaunchSiteProfile] Error for userId: ${launchSiteProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save launch site: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
