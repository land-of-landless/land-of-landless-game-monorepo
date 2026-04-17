import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import EnergyGeneratorDAO from "@/daos/redis/energyGenerator";
import EnergyGeneratorService from "@/services/energyGenerator/EnergyGeneratorService";
import { EnergyGeneratorUpgradeInput } from "../../../validators/schemas";
import { ApiResponse } from "../utils/response";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";

export default class EnergyGeneratorController {
    static async getEnergyGeneratorProfile(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.userId;

            if (_.isArray(userId)) {
                throw ERRORS.VALIDATION("Invalid userId");
            }

            const energyGeneratorProfile =
                await EnergyGeneratorDAO.findEnergyGeneratorByUserId(
                    userId as string,
                );
            return ApiResponse.success(res, energyGeneratorProfile);
        } catch (error) {
            next(error);
        }
    }

    static async upgradeEnergyGenerator(
        req: Request<ParamsDictionary, any, EnergyGeneratorUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const validatedBody = (req as any)
                .validatedBody as EnergyGeneratorUpgradeInput;
            const operation = validatedBody.operation;
            const userId = req.auth!.userId;

            if (operation === "start") {
                const startToUpgradeTime =
                    await EnergyGeneratorService.upgradeEnergyGeneratorStart(
                        userId,
                    );
                return ApiResponse.success(res, { startToUpgradeTime });
            } else if (operation === "end") {
                await EnergyGeneratorService.upgradeEnergyGeneratorEnd(
                    userId,
                    false,
                );
                return ApiResponse.success(res, { success: true });
            } else if (operation === "end-with-gem") {
                await EnergyGeneratorService.upgradeEnergyGeneratorEnd(
                    userId,
                    true,
                );
                return ApiResponse.success(res, { success: true });
            }
        } catch (error) {
            next(error);
        }
    }

    static async addPanel(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        const userId = req.auth!.userId;

        try {
            await EnergyGeneratorService.addPanel(userId);
            return ApiResponse.success(res, { success: true });
        } catch (error) {
            next(error);
        }
    }
}
