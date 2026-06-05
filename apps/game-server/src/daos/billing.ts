import { db } from "@/daos/connection.js";
import { billings, invoices } from "@/models/schema.js";
import { eq } from "drizzle-orm";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for Billing-related operations using PostgreSQL.
 */
export default class BillingDAO {
    static async createBilling(billingData: any) {
        try {
            return await db.transaction(async tx => {
                await tx
                    .insert(billings)
                    .values({ userId: billingData.userId })
                    .onConflictDoNothing();
                if (billingData.finishedInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingData.finishedInvoices.map((id: string) => ({
                            id,
                            userId: billingData.userId,
                            status: "finished",
                        }))
                    );
                }
                if (billingData.ongoingInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingData.ongoingInvoices.map((id: string) => ({
                            id,
                            userId: billingData.userId,
                            status: "ongoing",
                        }))
                    );
                }
                return billingData;
            });
        } catch (error) {
            logger.error(
                `[BillingDAO.createBilling] Error for userId: ${billingData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create billing: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findBillingById(userId: string) {
        try {
            const result = await db.query.billings.findFirst({
                where: eq(billings.userId, userId),
            });
            if (!result) return null;

            const invs = await db
                .select()
                .from(invoices)
                .where(eq(invoices.userId, userId));
            return {
                userId: result.userId,
                finishedInvoices: invs
                    .filter(i => i.status === "finished")
                    .map(i => i.id),
                ongoingInvoices: invs
                    .filter(i => i.status === "ongoing")
                    .map(i => i.id),
            };
        } catch (error) {
            logger.error(
                `[BillingDAO.findBillingById] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch billing: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async saveBillingProfile(billingProfile: any) {
        try {
            return await db.transaction(async tx => {
                await tx
                    .insert(billings)
                    .values({ userId: billingProfile.userId })
                    .onConflictDoNothing();
                await tx
                    .delete(invoices)
                    .where(eq(invoices.userId, billingProfile.userId));
                if (billingProfile.finishedInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingProfile.finishedInvoices.map((id: string) => ({
                            id,
                            userId: billingProfile.userId,
                            status: "finished",
                        }))
                    );
                }
                if (billingProfile.ongoingInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingProfile.ongoingInvoices.map((id: string) => ({
                            id,
                            userId: billingProfile.userId,
                            status: "ongoing",
                        }))
                    );
                }
                return billingProfile;
            });
        } catch (error) {
            logger.error(
                `[BillingDAO.saveBillingProfile] Error for userId: ${billingProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save billing: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
