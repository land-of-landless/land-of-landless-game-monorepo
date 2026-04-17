import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { LaunchSiteDAO } from "@/daos/redis/launchSite";
import LaunchSiteService from "@/services/launchSite/LaunchSiteService";
import { LaunchSiteUpgradeInput, LaunchItemInput } from "@/validators/schemas";
import { LAUNCH_SITE_NOT_FOUND } from "@/api/v1/errors/index";
import { ApiResponse } from "../utils/response";

/**
 * Controller for handling Launch Site-related API requests.
 ...
 */
export default class LaunchSiteController {
    /**
     * Retrieves the launch site profile for the authenticated user.
     */
    static async getLaunchSiteProfile(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.auth!.userId;
            const launchSite =
                await LaunchSiteDAO.findLaunchSiteByUserId(userId);

            if (!launchSite) {
                return ApiResponse.error(
                    res,
                    404,
                    "404",
                    "LAUNCH_SITE_NOT_FOUND",
                    LAUNCH_SITE_NOT_FOUND,
                );
            }

            return ApiResponse.success(res, launchSite);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Starts the upgrade process for the launch site.
     */
    static async upgradeStart(
        req: Request<ParamsDictionary, any, LaunchSiteUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const upgradeTimer = await LaunchSiteService.upgradeLaunchSiteStart(
                req.auth!.userId,
            );

            return ApiResponse.success(res, {
                upgradeTimer,
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Completes the upgrade process for the launch site.
     */
    static async upgradeEnd(
        req: Request<ParamsDictionary, any, LaunchSiteUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { skipWithGem } = req.body;

            const launchSite = await LaunchSiteService.upgradeLaunchSiteEnd(
                req.auth!.userId,
                skipWithGem,
            );

            return ApiResponse.success(res, launchSite);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Launches an item from the launch site.
     */
    static async launchItem(
        req: Request<ParamsDictionary, any, LaunchItemInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { itemType } = req.body;
            const launchSite = await LaunchSiteService.launchItem(
                req.auth!.userId,
                itemType,
            );

            return ApiResponse.success(res, launchSite);
        } catch (error: any) {
            next(error);
        }
    }
}
