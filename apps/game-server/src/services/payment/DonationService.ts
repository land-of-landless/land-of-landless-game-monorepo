import BillingDAO from "@/daos/postgres/billing.ts";
import { normalizeOxaPayStatus } from "@/daos/oxaPay/index.js";
import { paymentLogger } from "@/utils/logger.js";
import type { OxaPayWebhookPayload } from "@/daos/oxaPay/types.js";
import type { NewDonation } from "@/models/postgres/billing.js";

export default class DonationService {
    /**
     * Parses donor information from the OxaPay orderId string.
     * Supports both plain userId strings and JSON-encoded structures.
     */
    static parseDonorInfo(orderId: string | null | undefined): {
        userId: string | null;
        notes?: string;
    } {
        if (!orderId || orderId.trim() === "") {
            return { userId: null };
        }

        try {
            const parsed = JSON.parse(orderId);
            if (typeof parsed === "object" && parsed !== null) {
                return {
                    userId: parsed.userId ?? parsed.user_id ?? null,
                    notes: parsed.notes ?? parsed.description ?? undefined,
                };
            }
            return { userId: orderId };
        } catch {
            // Not a JSON object, treat as plain userId string
            return { userId: orderId };
        }
    }

    /**
     * Handles the webhook/IPN payload from OxaPay for donation routes.
     */
    static async handleDonationCallback(
        payload: OxaPayWebhookPayload
    ): Promise<{ success: boolean; donationId: string }> {
        const trackId = payload.track_id ?? payload.trackId;
        if (!trackId) {
            paymentLogger.error(
                "Donation callback received with missing track_id",
                { payload }
            );
            throw new Error("Missing track_id in donation webhook payload");
        }

        const rawStatus = payload.status;
        const normalizedStatus = normalizeOxaPayStatus(rawStatus);

        paymentLogger.info("Processing donation webhook", {
            trackId,
            status: rawStatus,
            normalizedStatus,
        });

        // Parse donor/order information
        const orderId =
            (typeof payload.order_id === "string"
                ? payload.order_id
                : undefined) ??
            (typeof payload.orderId === "string" ? payload.orderId : undefined);

        const { userId } = this.parseDonorInfo(orderId);

        // Map webhook payload properties to database model
        const amount = String(payload.amount ?? "0");
        const currency =
            typeof payload.currency === "string" ? payload.currency : "USDT";
        const txId =
            typeof payload.txId === "string"
                ? payload.txId
                : typeof payload.tx_id === "string"
                  ? payload.tx_id
                  : null;
        const network =
            typeof payload.network === "string" ? payload.network : null;
        const paymentAddress =
            typeof payload.paymentAddress === "string"
                ? payload.paymentAddress
                : typeof payload.payment_address === "string"
                  ? payload.payment_address
                  : null;

        const donationData: NewDonation = {
            id: trackId,
            user_id: userId,
            amount,
            currency,
            status: normalizedStatus,
            tx_id: txId,
            network,
            payment_address: paymentAddress,
            order_id: orderId ?? null,
            raw_payload: payload,
        };

        // Write/Upsert donation record to database
        const savedDonation = await BillingDAO.upsertDonation(donationData);
        paymentLogger.info("Donation record saved to database", {
            donationId: savedDonation.id,
            status: savedDonation.status,
            userId: savedDonation.user_id,
        });

        // Trigger hooks based on status
        if (normalizedStatus === "paid") {
            try {
                await this.onDonationSuccess(savedDonation);
            } catch (error) {
                paymentLogger.error(
                    "Error running post-donation success hooks",
                    {
                        donationId: savedDonation.id,
                        error,
                    }
                );
                // Note: We still return success: true because the payment was successfully
                // received and written to the database. We don't want OxaPay to keep retrying.
            }
        } else if (normalizedStatus === "failed") {
            await this.onDonationFailure(savedDonation);
        }

        return { success: true, donationId: savedDonation.id };
    }

    /**
     * Boilerplate hook executed when a donation succeeds.
     * This is where you can credit resources, add items, or announce to the game world.
     */
    private static async onDonationSuccess(donation: any): Promise<void> {
        paymentLogger.info(
            `[HOOK] Running onDonationSuccess for donation: ${donation.id}`,
            {
                userId: donation.user_id,
                amount: donation.amount,
                currency: donation.currency,
            }
        );

        if (!donation.user_id) {
            paymentLogger.info(
                "[HOOK] Anonymous donation succeeded. No user profile to reward."
            );
            return;
        }

        // BOILERPLATE: Interact with user profile, add items or perks.
        // For example, if you want to reward premium currency or game stats:
        /*
        try {
            // 1. Fetch user's profile
            const profile = await ProfileDAO.findProfileById(donation.user_id);
            if (profile) {
                // 2. Calculate currency/reward (e.g. 100 gold per dollar)
                const usdValue = parseFloat(donation.amount);
                const goldReward = Math.round(usdValue * 100);

                // 3. Update player rewards/stats
                await ProfileDAO.addGoldToUser(donation.user_id, goldReward);
                paymentLogger.info(`[HOOK] Credited ${goldReward} gold to user ${donation.user_id}`);
            }
        } catch (err) {
            paymentLogger.error("Failed to reward user for donation", { userId: donation.user_id, err });
        }
        */
    }

    /**
     * Boilerplate hook executed when a donation fails.
     */
    private static async onDonationFailure(donation: any): Promise<void> {
        paymentLogger.info(
            `[HOOK] Running onDonationFailure for donation: ${donation.id}`,
            {
                userId: donation.user_id,
                status: donation.status,
            }
        );

        // BOILERPLATE: Handle failed payments / notifications.
    }
}
