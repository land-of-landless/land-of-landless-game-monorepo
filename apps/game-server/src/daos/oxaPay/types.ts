/** Normalized status used internally */
export type OxaPayNormalizedStatus =
    | "pending"
    | "paying"
    | "paid"
    | "failed"
    | "expired";

export type OxaPayApiResponse<T> = {
    data?: T;
    message?: string;
    error?: {
        type?: string;
        key?: string;
        message?: string;
    } | null;
    status?: number;
    version?: string;
};

export type OxaPayCreateInvoiceData = {
    track_id?: string;
    trackId?: string;
    pay_link?: string;
    payLink?: string;
    payment_url?: string;
    paymentUrl?: string;
    expired_at?: number;
    expiredAt?: number;
    date?: number;
};

export type OxaPayPaymentInfoData = {
    track_id?: string;
    trackId?: string;
    status?: string;
    amount?: number | string;
    currency?: string;
    order_id?: string;
    orderId?: string;
    pay_link?: string;
    payLink?: string;
    type?: string;
};

/** Webhook / IPN payload (snake_case per OxaPay docs) */
export type OxaPayWebhookPayload = {
    track_id?: string;
    trackId?: string;
    status?: string;
    type?: string;
    amount?: number | string;
    currency?: string;
    order_id?: string;
    orderId?: string;
    [key: string]: unknown;
};
