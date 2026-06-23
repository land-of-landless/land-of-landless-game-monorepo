import { db } from "@/daos/postgres/connection.ts";
import { billings, invoices, donations } from "@/models/postgres/schema.js";
import { eq } from "drizzle-orm";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import type { Donation, NewDonation } from "@/models/postgres/billing.js";

/**
 * Data Access Object for Billing-related operations using PostgreSQL.
 */
export default class BillingDAO {
    static async createBilling(billingData: any) {
        try {
            return await db.transaction(async tx => {
                await tx
                    .insert(billings)
                    .values({ user_id: billingData.userId })
                    .onConflictDoNothing();
                if (billingData.finishedInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingData.finishedInvoices.map((id: string) => ({
                            id,
                            user_id: billingData.userId,
                            status: "finished",
                        }))
                    );
                }
                if (billingData.ongoingInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingData.ongoingInvoices.map((id: string) => ({
                            id,
                            user_id: billingData.userId,
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
                where: eq(billings.user_id, userId),
            });
            if (!result) return null;

            const invs = await db
                .select()
                .from(invoices)
                .where(eq(invoices.user_id, userId));
            return {
                userId: result.user_id,
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
                    .values({ user_id: billingProfile.userId })
                    .onConflictDoNothing();
                await tx
                    .delete(invoices)
                    .where(eq(invoices.user_id, billingProfile.userId));
                if (billingProfile.finishedInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingProfile.finishedInvoices.map((id: string) => ({
                            id,
                            user_id: billingProfile.userId,
                            status: "finished",
                        }))
                    );
                }
                if (billingProfile.ongoingInvoices?.length > 0) {
                    await tx.insert(invoices).values(
                        billingProfile.ongoingInvoices.map((id: string) => ({
                            id,
                            user_id: billingProfile.userId,
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

    // ==================== Donation Methods ====================

    static async upsertDonation(donationData: NewDonation): Promise<Donation> {
        try {
            const result = await db
                .insert(donations)
                .values(donationData)
                .onConflictDoUpdate({
                    target: donations.id,
                    set: {
                        status: donationData.status,
                        tx_id: donationData.tx_id,
                        network: donationData.network,
                        payment_address: donationData.payment_address,
                        raw_payload: donationData.raw_payload,
                        updated_at: new Date(),
                    },
                })
                .returning();
            return result[0];
        } catch (error) {
            logger.error(
                `[BillingDAO.upsertDonation] Error for trackId: ${donationData.id}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to upsert donation: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findDonationById(id: string): Promise<Donation | null> {
        try {
            const result = await db.query.donations.findFirst({
                where: eq(donations.id, id),
            });
            return result ?? null;
        } catch (error) {
            logger.error(
                `[BillingDAO.findDonationById] Error for donation id: ${id}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch donation: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findDonationsByUserId(userId: string): Promise<Donation[]> {
        try {
            return await db
                .select()
                .from(donations)
                .where(eq(donations.user_id, userId));
        } catch (error) {
            logger.error(
                `[BillingDAO.findDonationsByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch donations for user: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
