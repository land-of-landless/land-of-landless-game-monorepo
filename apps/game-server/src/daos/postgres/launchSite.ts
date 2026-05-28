import { db } from "./connection.js";
import {
    launchSites,
    satelliteTimers,
    dysonSphereTimers,
} from "../../models/postgres/schema.js";
import { eq } from "drizzle-orm";

export class LaunchSitePostgresDAO {
    static async save(data: any) {
        return await db.transaction(async (tx) => {
            await tx
                .insert(launchSites)
                .values({
                    userId: data.userId,
                    level: data.level,
                    launchSiteUpgradeTimer: data.launch_site_upgrade_timer
                        ? new Date(data.launch_site_upgrade_timer)
                        : null,
                    satellitesLaunched: data.satellites_launched,
                    wormholesLaunched: data.wormholes_launched,
                    astroidDiggersLaunched: data.astroid_diggers_launched,
                    cyborgsLaunched: data.cyborgs_launched,
                    dysonSpherePartsLaunched: data.dyson_sphere_parts_launched,
                })
                .onConflictDoUpdate({
                    target: launchSites.userId,
                    set: {
                        level: data.level,
                        launchSiteUpgradeTimer: data.launch_site_upgrade_timer
                            ? new Date(data.launch_site_upgrade_timer)
                            : null,
                        satellitesLaunched: data.satellites_launched,
                        wormholesLaunched: data.wormholes_launched,
                        astroidDiggersLaunched: data.astroid_diggers_launched,
                        cyborgsLaunched: data.cyborgs_launched,
                        dysonSpherePartsLaunched: data.dyson_sphere_parts_launched,
                    },
                });

            await tx
                .delete(satelliteTimers)
                .where(eq(satelliteTimers.userId, data.userId));
            if (data.satellite_timers?.length > 0) {
                await tx.insert(satelliteTimers).values(
                    data.satellite_timers.map((timer: string) => ({
                        userId: data.userId,
                        timer: new Date(timer),
                    })),
                );
            }

            await tx
                .delete(dysonSphereTimers)
                .where(eq(dysonSphereTimers.userId, data.userId));
            if (data.dyson_sphere_timers?.length > 0) {
                await tx.insert(dysonSphereTimers).values(
                    data.dyson_sphere_timers.map((timer: string) => ({
                        userId: data.userId,
                        timer: new Date(timer),
                    })),
                );
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.launchSites.findFirst({
            where: eq(launchSites.userId, userId),
        });
        if (!res) return null;

        const sTimers = await db
            .select()
            .from(satelliteTimers)
            .where(eq(satelliteTimers.userId, userId));
        const dTimers = await db
            .select()
            .from(dysonSphereTimers)
            .where(eq(dysonSphereTimers.userId, userId));

        return {
            userId: res.userId,
            level: res.level,
            launch_site_upgrade_timer: res.launchSiteUpgradeTimer?.toISOString() || "",
            satellites_launched: res.satellitesLaunched,
            satellite_timers: sTimers.map((t) => t.timer.toISOString()),
            wormholes_launched: res.wormholesLaunched,
            astroid_diggers_launched: res.astroidDiggersLaunched,
            cyborgs_launched: res.cyborgsLaunched,
            dyson_sphere_parts_launched: res.dysonSpherePartsLaunched,
            dyson_sphere_timers: dTimers.map((t) => t.timer.toISOString()),
        };
    }
}
