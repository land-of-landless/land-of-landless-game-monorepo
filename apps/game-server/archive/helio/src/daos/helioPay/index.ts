// import oxaPayAxiosInstance from "@/axios/oxaPayAxiosInstance";
import HelioPayAxiosInstance from "@/axios/HelioPayAxiosInstance.js";
import { paymentLogger } from "../../utils/logger.ts";
import { appConfig, isDevelopment } from "@/config/environment.js";

export type PaylinkEventPayload = {
    event: PaylinkEvents; // e.g. 'CREATED'
    transaction: string; // JSON string value of the transactionObject
    transactionObject: Transaction;
};

export type Transaction = {
    id: string;
    paylinkId: string;
    quantity: number;
    fee?: string;
    createdAt: string;
    paymentType: PaymentRequestType;
    claimDetails?: {
        tradingView?: {
            username: string;
        };
        discord?: {
            username: string;
        };
    };
    meta: TransactionMeta;
};

export enum TransactionStatus {
    INITIATED = "INITIATED",
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
    SETTLED = "SETTLED",
}

export type WebhookResponseBody = {
    transaction: string;
    event: PaylinkEvents;
    transactionObject: Transaction;
};

export type TransactionMeta = {
    id: string;
    transactionSignature: string; // transaction hash on the blockchain
    amount: string;
    recipientPK: string; // merchant's public key (wallet address)
    senderPK: string; // customer's public key (wallet address)
    customerDetails: {
        email?: string;
        discordUsername?: string;
        discordUser?: {
            id: string;
            username: string;
        };
        twitterUsername?: string;
        fullName?: string;
        country?: string;
        deliveryAddress?: string;
        phoneNumber?: string;
        street?: string;
        streetNumber?: string;
        city?: string;
        state?: string;
        areaCode?: string;
        additionalJSON?: string;
    };
    productDetails: {
        // From 'advanced options' (step 3 of paylink creation) -> additional information
        name?: string;
        value?: string;
    };
    splitRevenue: boolean;
    remainingAccounts: {
        amount: string;
        recipient: string;
    }[];
    totalAmount: string;
    affiliateAmount: string;
    affiliateCode?: string;
    affiliatePublicKey?: string;
    currency: {
        id: string;
        blockchain?: { engine: BlockchainEngine } | null;
    };
    transactionType?: TransactionType;
    tokenQuote?: TokenQuoteMeta;
    transactionStatus: TransactionStatus; // e.g. 'SUCCESS'
};

// used for converting between pricing currency (from) and what they paid with (to)
// note: from could be a crypto currency (e.g. (0.1 ETH), or fiat currency (e.g. $5)
// to is always going to be a crypto currency.
// This is useful when using swaps, to see what they paid
export type TokenQuoteMeta = {
    from: string;
    fromAmountDecimal: string;
    to: string;
    toAmountMinimal: string;
};

export type BlockchainEngine = {
    id: string;
    type: BlockchainEngineType;
};

export enum PaymentRequestType {
    PAYLINK = "PAYLINK",
    PAYSTREAM = "PAYSTREAM",
}

export enum PaylinkEvents {
    CREATED = "CREATED",
}

export enum TransactionType {
    REFUND = "REFUND",
    PAYLINK = "PAYLINK",
}

export enum BlockchainEngineType {
    EVM = "EVM",
    SOL = "SOL",
    BTC = "BTC",
}

export enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
}

export interface PaymentDetails {
    paymentId: string;
    amount: number;
    recipient: string;
    status: PaymentStatus;
    // Add other relevant details as needed
}

export interface GETChargeDetails {
    code?: number;
    message?: string;
    id: string;
    currencySymbol: string;
    requestAmount: string;
    usdcAmount: string;
    token: string;
    prepareRequestBody: {
        currency: string;
        amount: string;
        quantity: number;
        pricingCurrencyRateToken: string;
    };
    paylinkTx: null | {
        id: string;
        paylinkId: string;
        fee: string;
        quantity: number;
        createdAt: string;
        paymentType: string;
        meta: TransactionMeta;
    };
    pricingCurrencyRequestAmount: string;
    isSubscriptionRenewal: boolean;
    paylink: any;
}

export interface GenerateChargeResponse {
    id: string;
    pageUrl: string;
}

export type FetchWebhooksForAPayLinkWebhook = {
    id: string;
    creator?: string | undefined;
    paylink: string;
    company: string;
    targetUrl: string;
    events: PaylinkEvents[];
    sharedToken: string;
};

export default class HelioPay {
    //*

    //
    static async fetchCharge(chargeId: string) {
        try {
            const response = await HelioPayAxiosInstance.get<GETChargeDetails>(
                `/charge/${chargeId}`,
            );

            return response.data;
        } catch (error) {
            console.error("Error fetching invoice:", error);
            throw error;
        }
    }

    static async generateCharge(
        userId: string,
        itemType: string,
        itemIndex: number,
        payLinkId: string,
        requestAmount: number,
        additionalInfo?: any,
    ) {
        try {
            if (requestAmount <= 0) {
                throw new Error("Invalid amount");
            }

            // for api
            let formattedRequestAmount = isDevelopment()
                ? (requestAmount / 1000).toString() // for easier payment
                : requestAmount.toString();

            let response =
                await HelioPayAxiosInstance.post<GenerateChargeResponse>(
                    `/charge/api-key?apiKey=${appConfig.helio.apiKey}`,
                    {
                        paymentRequestId: payLinkId,
                        requestAmount: formattedRequestAmount,
                        prepareRequestBody: {
                            customerDetails: {
                                additionalJSON: JSON.stringify({
                                    userId,
                                    itemType,
                                    itemIndex,
                                    additionalInfo: additionalInfo
                                        ? additionalInfo
                                        : null,
                                }),
                            },
                        },
                    },
                );

            // extract charge main id from returned url
            // because this is the id that we can use to query info about this charge

            let transformedResponse = {
                ...response.data,

                chargeId: response.data.pageUrl.split("/").pop(),
            };

            return transformedResponse;
        } catch (error) {
            console.error("Error fetching invoice:", error);
            throw error;
        }
    }

    static async fetchWebhooksForAPayLink(paylinkId: string) {
        try {
            let response = await HelioPayAxiosInstance.get<
                FetchWebhooksForAPayLinkWebhook[]
            >(
                `/webhook/paylink/transaction?apiKey=${appConfig.helio.apiKey}&paylinkId=${paylinkId}`,
                {},
            );

            return response.data;
        } catch (error) {
            paymentLogger.error("HelioPay operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    static async createGlobalWebhook() {
        try {
            let response =
                await HelioPayAxiosInstance.post<FetchWebhooksForAPayLinkWebhook>(
                    `/webhook/paylink/api-key?apiKey=${appConfig.helio.apiKey}`,
                    {
                        name: "global-webhook-dev",
                        targetUrl: appConfig.helio.callbackUrl,
                    },
                );

            return response.data;
        } catch (error) {
            paymentLogger.error("HelioPay operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    static async createWebhookForAPayLink(paylinkId: string) {
        try {
            let response =
                await HelioPayAxiosInstance.post<FetchWebhooksForAPayLinkWebhook>(
                    `/webhook/paylink/transaction?apiKey=${appConfig.helio.apiKey}`,
                    {
                        paylinkId: paylinkId,
                        targetUrl: appConfig.helio.callbackUrl,
                        events: ["CREATED"],
                    },
                );

            return response.data;
        } catch (error) {
            paymentLogger.error("HelioPay operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    static async deleteWebhookForAPayLink(webhookId: string) {
        try {
            HelioPayAxiosInstance.delete(
                `/webhook/paylink/transaction/${webhookId}?apiKey=${appConfig.helio.apiKey}`,
                {},
            );
        } catch (error) {
            paymentLogger.error("HelioPay operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }
}
