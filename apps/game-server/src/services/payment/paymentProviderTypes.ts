/**
 * Provider-agnostic payment types used by shop and payment services.
 */

export type ProviderInvoiceStatus =
    | "pending"
    | "paying"
    | "paid"
    | "failed"
    | "expired";

export type ProviderInvoice = {
    trackId: string;
    payUrl: string | null;
    status: ProviderInvoiceStatus;
    amount: number | null;
    currency: string | null;
    orderId: string | null;
};

export type CreateInvoiceResult = {
    trackId: string;
    payUrl: string;
    /** Alias kept for ShopService / clients expecting Helio field names */
    chargeId: string;
    pageUrl: string;
};
