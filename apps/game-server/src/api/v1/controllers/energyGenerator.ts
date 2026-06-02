import { Request, Response, NextFunction } from "express";
import { EnergyGeneratorDAO } from "@/daos/postgres/energyGenerator.js";
import EnergyGeneratorService from "@/services/energyGenerator/EnergyGeneratorService.js";
import { EnergyGeneratorUpgradeInput } from "../../../validators/schemas.js";
import { ApiResponse } from "../utils/response.ts";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.ts";

export default class EnergyGeneratorController {
    static async getEnergyGeneratorProfile(
        req: Request,
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
        req: Request<any, any, EnergyGeneratorUpgradeInput>,
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

    static async addPanel(req: Request, res: Response, next: NextFunction) {
        const userId = req.auth!.userId;

        try {
            await EnergyGeneratorService.addPanel(userId);
            return ApiResponse.success(res, { success: true });
        } catch (error) {
            next(error);
        }
    }
}
