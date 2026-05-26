# Archived Hel.io payment integration

**Archived:** 2026-05-26  
**Reason:** Replaced by [OxaPay](https://oxapay.com) (`src/daos/oxaPay/`).

This folder is **not compiled** (outside `tsconfig` `include`). It preserves the previous implementation for reference only.

## Original environment variables (names only)

- `HELIO_BASE_URL`
- `HELIO_API_KEY`
- `HELIO_API_SECRET`
- `HELIO_DYNAMIC_PAY_LINK`
- `HELIO_GLOBAL_WEBHOOK_SECRET`
- `HELIO_DYNAMIC_PAY_LINK_CALLBACK_URL`

Webhooks were configured in the Hel.io dashboard (paylink / global webhook) pointing at `POST /api/v1/payment/callback` with a Bearer shared secret.

## Manual test plan (OxaPay — current provider)

1. Set `OXAPAY_MERCHANT_API_KEY`, `OXAPAY_CALLBACK_URL` (e.g. ngrok → `https://<host>/api/v1/payment/callback`).
2. `POST /api/v1/shop/purchase` with `payBy: "money"` → expect `invoiceId` and `pageUrl`.
3. Complete payment on the OxaPay hosted page.
4. Confirm webhook `Paid` → gems/game pass applied; invoice in `finishedInvoices`.
5. `POST /api/v1/payment/process-invoice` with full `invoiceId` (`trackId|itemType|itemIndex`) if webhook is delayed.
6. Retry purchase for the same item while pending → same `track_id` returned.

Optional local dev: `OXAPAY_SKIP_WEBHOOK_VERIFY=true` to skip HMAC on callbacks (never in production).
