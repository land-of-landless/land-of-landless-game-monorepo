/**
 * Security Audit Regression Tests
 *
 * These tests validate the specific logic errors and vulnerabilities described
 * in SECURITY_AUDIT.md. Each test suite corresponds to a numbered finding in
 * the report.
 *
 * Tests are intentionally written to EXPOSE the current broken behaviour so
 * that fixes will turn the failing assertions into passing ones (or the
 * "currently broken" assertions will need to be inverted after a fix).
 *
 * All tests operate on pure Zod schemas and constants — no database or network
 * connections are required.
 */

import assert from "node:assert/strict";
import { describe, it } from "mocha";

// ─── schemas ────────────────────────────────────────────────────────────────
import {
    MINE_UPGRADE_SCHEMA,
    SHOP_PURCHASE_SCHEMA,
    FACTORY_BUILD_ITEM_SCHEMA,
    MINI_GAME_2_SCHEMA,
    MINI_GAME_3_SCHEMA,
    MINI_GAME_4_SCHEMA,
} from "@/validators/schemas.js";

// ─── shop constants ──────────────────────────────────────────────────────────
import {
    SHOP_MAX_GEM_ITEM_INDEX,
    SHOP_MAX_COIN_ITEM_INDEX,
    SHOP_MAX_ROBOT_ITEM_INDEX,
    SHOP_MAX_GAME_PASS_ITEM_INDEX,
    SHOP_GEM_ITEMS,
    SHOP_ROBOT_ITEMS,
    SHOP_COIN_ITEMS,
    SHOP_PASS_ITEMS,
} from "@/constants/shop.js";

// ─── mine constants ──────────────────────────────────────────────────────────
import { MINE_MAX_MINER_COUNT } from "@/constants/mine.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns true when the Zod schema accepts the given data. */
function accepts(schema: { safeParse(v: unknown): { success: boolean } }, data: unknown): boolean {
    return schema.safeParse(data).success;
}

/** Returns the first error message when the Zod schema rejects the given data. */
function firstError(schema: { safeParse(v: unknown): { success: boolean; error?: { issues: { message: string }[] } } }, data: unknown): string | undefined {
    const result = schema.safeParse(data);
    if (result.success) return undefined;
    return result.error?.issues[0]?.message;
}

// ═════════════════════════════════════════════════════════════════════════════
// Section 4-A — Mine ID Mismatch  (SECURITY_AUDIT.md §4.A)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §4.A – Mine ID mismatch (MINE_UPGRADE_SCHEMA)", () => {
    /**
     * Miners in the data model are named miner1, miner2, miner3.
     * The schema uses min(0).max(2) which allows mineId=0 (maps to the
     * non-existent key "miner0") and rejects mineId=3 (a perfectly valid
     * miner).
     *
     * The schema should be min(1).max(MINE_MAX_MINER_COUNT) i.e. min(1).max(3).
     */

    it("schema constant MINE_MAX_MINER_COUNT is 3", () => {
        assert.equal(MINE_MAX_MINER_COUNT, 3);
    });

    // ── values that SHOULD be valid (miners 1, 2, 3) ─────────────────────

    it("accepts mineId=1 (valid miner)", () => {
        assert.ok(accepts(MINE_UPGRADE_SCHEMA, { mineId: 1, operation: "start" }));
    });

    it("accepts mineId=2 (valid miner)", () => {
        assert.ok(accepts(MINE_UPGRADE_SCHEMA, { mineId: 2, operation: "start" }));
    });

    // ── BUG: mineId=3 is valid in the service but rejected by the schema ──

    it("BUG – rejects mineId=3 even though miner3 exists in the data model", () => {
        const result = MINE_UPGRADE_SCHEMA.safeParse({ mineId: 3, operation: "start" });
        // Currently the schema max is 2, so 3 is rejected.
        // After the fix (max changed to 3), this assertion should be inverted.
        assert.equal(result.success, false, "mineId=3 should be valid but the schema currently rejects it");
    });

    // ── BUG: mineId=0 does not correspond to any miner ───────────────────

    it("BUG – accepts mineId=0 even though no miner0 exists (would cause a crash)", () => {
        const result = MINE_UPGRADE_SCHEMA.safeParse({ mineId: 0, operation: "start" });
        // Currently the schema min is 0, so 0 passes.
        // After the fix (min changed to 1), this assertion should be inverted.
        assert.equal(result.success, true, "mineId=0 currently passes schema validation but will crash the service");
    });

    // ── negative values are always rejected ──────────────────────────────

    it("rejects negative mineId", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { mineId: -1, operation: "start" }), false);
    });

    it("rejects mineId=4 (exceeds any valid range)", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { mineId: 4, operation: "start" }), false);
    });

    it("rejects non-integer mineId", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { mineId: 1.5, operation: "start" }), false);
    });

    it("rejects string mineId", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { mineId: "1", operation: "start" }), false);
    });

    it("rejects missing mineId", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { operation: "start" }), false);
    });

    // ── operation field ───────────────────────────────────────────────────

    it("accepts all valid operations with a valid mineId", () => {
        for (const op of ["start", "end", "end-with-gem"] as const) {
            assert.ok(accepts(MINE_UPGRADE_SCHEMA, { mineId: 1, operation: op }), `operation "${op}" should be accepted`);
        }
    });

    it("rejects unknown operation", () => {
        assert.equal(accepts(MINE_UPGRADE_SCHEMA, { mineId: 1, operation: "guess" }), false);
    });

    // ── boundary summary that documents the off-by-one ───────────────────

    it("documents the allowed range: schema permits [0,2] but service needs [1,3]", () => {
        // Allowed by schema
        const schemaAllows0 = accepts(MINE_UPGRADE_SCHEMA, { mineId: 0, operation: "start" });
        const schemaAllows1 = accepts(MINE_UPGRADE_SCHEMA, { mineId: 1, operation: "start" });
        const schemaAllows2 = accepts(MINE_UPGRADE_SCHEMA, { mineId: 2, operation: "start" });
        const schemaAllows3 = accepts(MINE_UPGRADE_SCHEMA, { mineId: 3, operation: "start" });

        // Current (buggy) state: 0 and 1 and 2 pass; 3 fails
        assert.equal(schemaAllows0, true,  "0 currently allowed (should NOT be)");
        assert.equal(schemaAllows1, true,  "1 is allowed (correct)");
        assert.equal(schemaAllows2, true,  "2 is allowed (correct)");
        assert.equal(schemaAllows3, false, "3 is currently blocked (should NOT be)");
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 4-C — Shop Index Out of Sync  (SECURITY_AUDIT.md §4.C)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §4.C – Shop hardcoded maxIndexes out of sync with shop constants", () => {
    /**
     * SHOP_PURCHASE_SCHEMA contains hardcoded maxIndexes:
     *   { gem: 4, robot: 10, coin: 5, game_pass: 2 }
     *
     * The actual shop constants define:
     *   SHOP_MAX_GEM_ITEM_INDEX      = 7  → schema cap of 4 blocks items 5, 6, 7
     *   SHOP_MAX_COIN_ITEM_INDEX     = 7  → schema cap of 5 blocks items 6, 7
     *   SHOP_MAX_ROBOT_ITEM_INDEX    = 2  → schema cap of 10 allows non-existent items 3-10
     *   SHOP_MAX_GAME_PASS_ITEM_INDEX = 2 → but only index 0 exists in SHOP_PASS_ITEMS;
     *                                       schema cap of 2 still allows non-existent 1 and 2
     */

    // ── gem items: schema max=4 vs actual max=7 ───────────────────────────

    it("actual SHOP_MAX_GEM_ITEM_INDEX is 7", () => {
        assert.equal(SHOP_MAX_GEM_ITEM_INDEX, 7);
    });

    it("SHOP_GEM_ITEMS contains 8 entries (indices 0-7)", () => {
        const indices = Object.keys(SHOP_GEM_ITEMS).map(Number);
        assert.equal(indices.length, 8);
        assert.ok(indices.includes(7));
    });

    it("BUG – gem itemIndex=5 is rejected even though SHOP_GEM_ITEMS[5] exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "gem", itemIndex: 5, payBy: "money" });
        assert.equal(result.success, false, "gem index 5 should be valid (item exists) but schema rejects it");
    });

    it("BUG – gem itemIndex=6 is rejected even though SHOP_GEM_ITEMS[6] exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "gem", itemIndex: 6, payBy: "money" });
        assert.equal(result.success, false, "gem index 6 should be valid (item exists) but schema rejects it");
    });

    it("BUG – gem itemIndex=7 is rejected even though SHOP_GEM_ITEMS[7] exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "gem", itemIndex: 7, payBy: "money" });
        assert.equal(result.success, false, "gem index 7 should be valid (item exists) but schema rejects it");
    });

    it("gem itemIndex=4 is accepted (schema cap — but is also the last valid index the schema allows)", () => {
        assert.ok(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "gem", itemIndex: 4, payBy: "money" }));
    });

    // ── robot items: schema max=10 vs actual max=2 ────────────────────────

    it("actual SHOP_MAX_ROBOT_ITEM_INDEX is 2", () => {
        assert.equal(SHOP_MAX_ROBOT_ITEM_INDEX, 2);
    });

    it("SHOP_ROBOT_ITEMS contains only 3 entries (indices 0, 1, 2)", () => {
        const indices = Object.keys(SHOP_ROBOT_ITEMS).map(Number);
        assert.equal(indices.length, 3);
        assert.ok(!indices.includes(3));
    });

    it("BUG – robot itemIndex=3 passes schema validation even though SHOP_ROBOT_ITEMS[3] does not exist", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "robot", itemIndex: 3, payBy: "gem" });
        assert.equal(result.success, true, "robot index 3 should be INVALID (no item) but the schema currently allows it");
    });

    it("BUG – robot itemIndex=10 passes schema validation even though no such item exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "robot", itemIndex: 10, payBy: "gem" });
        assert.equal(result.success, true, "robot index 10 should be INVALID but schema currently allows it");
    });

    it("robot itemIndex=11 is rejected (exceeds even the over-generous schema cap of 10)", () => {
        assert.equal(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "robot", itemIndex: 11, payBy: "gem" }), false);
    });

    // ── coin items: schema max=5 vs actual max=7 ──────────────────────────

    it("actual SHOP_MAX_COIN_ITEM_INDEX is 7", () => {
        assert.equal(SHOP_MAX_COIN_ITEM_INDEX, 7);
    });

    it("BUG – coin itemIndex=6 is rejected even though SHOP_COIN_ITEMS[6] exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "coin", itemIndex: 6, payBy: "money" });
        assert.equal(result.success, false, "coin index 6 should be valid (item exists) but schema rejects it");
    });

    it("BUG – coin itemIndex=7 is rejected even though SHOP_COIN_ITEMS[7] exists", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "coin", itemIndex: 7, payBy: "money" });
        assert.equal(result.success, false, "coin index 7 should be valid (item exists) but schema rejects it");
    });

    // ── game_pass items: schema max=2 vs only index 0 defined ────────────

    it("actual SHOP_MAX_GAME_PASS_ITEM_INDEX constant is 2", () => {
        assert.equal(SHOP_MAX_GAME_PASS_ITEM_INDEX, 2);
    });

    it("SHOP_PASS_ITEMS contains only 1 entry (index 0)", () => {
        const indices = Object.keys(SHOP_PASS_ITEMS).map(Number);
        assert.equal(indices.length, 1);
        assert.deepEqual(indices, [0]);
    });

    it("BUG – game_pass itemIndex=1 passes schema even though SHOP_PASS_ITEMS[1] does not exist", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "game_pass", itemIndex: 1, payBy: "gem" });
        assert.equal(result.success, true, "game_pass index 1 should be INVALID but schema currently allows it");
    });

    it("BUG – game_pass itemIndex=2 passes schema even though SHOP_PASS_ITEMS[2] does not exist", () => {
        const result = SHOP_PURCHASE_SCHEMA.safeParse({ itemType: "game_pass", itemIndex: 2, payBy: "gem" });
        assert.equal(result.success, true, "game_pass index 2 should be INVALID but schema currently allows it");
    });

    // ── general schema guards still work ─────────────────────────────────

    it("rejects negative itemIndex for any item type", () => {
        for (const itemType of ["gem", "robot", "coin", "game_pass"] as const) {
            assert.equal(
                accepts(SHOP_PURCHASE_SCHEMA, { itemType, itemIndex: -1, payBy: "gem" }),
                false,
                `negative itemIndex should be rejected for ${itemType}`
            );
        }
    });

    it("rejects unknown itemType", () => {
        assert.equal(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "unknown", itemIndex: 0, payBy: "gem" }), false);
    });

    it("rejects unknown payBy value", () => {
        assert.equal(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "gem", itemIndex: 0, payBy: "crypto" }), false);
    });

    it("accepts a well-formed valid purchase", () => {
        assert.ok(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "gem", itemIndex: 0, payBy: "money" }));
        assert.ok(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "robot", itemIndex: 0, payBy: "gem" }));
        assert.ok(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "coin", itemIndex: 0, payBy: "money" }));
        assert.ok(accepts(SHOP_PURCHASE_SCHEMA, { itemType: "game_pass", itemIndex: 0, payBy: "gem" }));
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 4-B — Factory padId Type Confusion  (SECURITY_AUDIT.md §4.B)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §4.B – Factory padId type confusion (FACTORY_BUILD_ITEM_SCHEMA)", () => {
    /**
     * The schema declares padId as z.string().min(1), but the service
     * casts it as `PadId` which is the type `0 | 1 | 2`.
     * Any non-numeric string (or a string representing a number outside 0-2)
     * will pass schema validation even though the service cannot process it
     * correctly.
     */

    const BASE = { operation: "start", itemId: "item-001" } as const;

    // ── BUG: non-numeric strings pass the schema ──────────────────────────

    it("BUG – padId='abc' passes schema even though the service expects a numeric pad index", () => {
        const result = FACTORY_BUILD_ITEM_SCHEMA.safeParse({ ...BASE, padId: "abc" });
        assert.equal(result.success, true, "non-numeric padId should be rejected but currently passes");
    });

    it("BUG – padId='999' passes schema even though pad 999 does not exist", () => {
        const result = FACTORY_BUILD_ITEM_SCHEMA.safeParse({ ...BASE, padId: "999" });
        assert.equal(result.success, true, "out-of-range padId string should be rejected but currently passes");
    });

    it("BUG – padId='-1' (negative as string) passes schema", () => {
        const result = FACTORY_BUILD_ITEM_SCHEMA.safeParse({ ...BASE, padId: "-1" });
        assert.equal(result.success, true, "negative padId string should be rejected but currently passes");
    });

    it("BUG – padId='3' passes schema even though only pads 0-2 are valid", () => {
        const result = FACTORY_BUILD_ITEM_SCHEMA.safeParse({ ...BASE, padId: "3" });
        assert.equal(result.success, true, "pad index 3 does not exist but the schema currently allows the string '3'");
    });

    // ── the one guard that does work: empty string ────────────────────────

    it("rejects empty string padId (min(1) guard works)", () => {
        assert.equal(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE, padId: "" }), false);
    });

    it("rejects missing padId", () => {
        assert.equal(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE }), false);
    });

    // ── numeric padId is rejected (schema is string-only, which is part of the type confusion) ──

    it("BUG – numeric padId=0 is rejected by schema even though service expects 0|1|2", () => {
        const result = FACTORY_BUILD_ITEM_SCHEMA.safeParse({ ...BASE, padId: 0 });
        assert.equal(result.success, false, "schema correctly rejects numeric 0, but the mismatch means valid inputs must be strings");
    });

    // ── valid-looking string pad IDs that the schema allows ──────────────

    it("accepts padId='0' (a string that LOOKS like a valid pad index)", () => {
        assert.ok(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE, padId: "0" }));
    });

    it("accepts padId='1'", () => {
        assert.ok(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE, padId: "1" }));
    });

    it("accepts padId='2'", () => {
        assert.ok(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE, padId: "2" }));
    });

    // ── other fields are validated correctly ─────────────────────────────

    it("rejects invalid operation value", () => {
        assert.equal(accepts(FACTORY_BUILD_ITEM_SCHEMA, { ...BASE, padId: "0", operation: "guess" }), false);
    });

    it("rejects empty itemId", () => {
        assert.equal(accepts(FACTORY_BUILD_ITEM_SCHEMA, { operation: "start", itemId: "", padId: "0" }), false);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 5 — Negative Value Injection  (SECURITY_AUDIT.md §5)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §5 – Negative value injection — deductResources validation logic", () => {
    /**
     * ProfileService.deductResources guards resource deductions with:
     *   if (amounts.coins !== undefined && amounts.coins > 0)  { ... validate ... }
     *   if (amounts.coins && amounts.coins > 0)               { ... deduct    ... }
     *
     * A negative amount passes the `!== undefined` check but FAILS `> 0`, so:
     *   - Phase 1 (validation): the balance check is skipped → negative passes silently
     *   - Phase 2 (execution):  the deduction is also skipped → no actual change
     *
     * Current behaviour is therefore "safe by accident" but represents a
     * defence-in-depth failure: if the Phase-2 guard were ever removed the
     * negative amount would INCREASE the balance.  The correct fix is to
     * validate that every amount is strictly positive (or zero) at the point
     * of entry.
     *
     * These tests verify the condition logic in isolation without a database.
     */

    /** Mirrors the Phase-1 guard in ProfileService.deductResources */
    function phase1ValidationWouldRun(amount: number | undefined): boolean {
        return amount !== undefined && amount > 0;
    }

    /** Mirrors the Phase-2 deduction guard in ProfileService.deductResources */
    function phase2DeductionWouldRun(amount: number | undefined): boolean {
        return Boolean(amount) && (amount as number) > 0;
    }

    it("positive amount triggers both validation and deduction", () => {
        assert.ok(phase1ValidationWouldRun(100));
        assert.ok(phase2DeductionWouldRun(100));
    });

    it("zero amount triggers neither validation nor deduction", () => {
        assert.equal(phase1ValidationWouldRun(0), false);
        assert.equal(phase2DeductionWouldRun(0), false);
    });

    it("BUG – negative amount bypasses Phase-1 balance validation", () => {
        // The value -10 is not undefined, but it is NOT > 0, so the guard fires false.
        assert.equal(
            phase1ValidationWouldRun(-10),
            false,
            "A negative amount silently bypasses the balance check — no error is thrown"
        );
    });

    it("Phase-2 also skips deduction for a negative amount (current accidental safety net)", () => {
        // Currently safe: Phase 2 also uses > 0, so the negative is not applied.
        assert.equal(
            phase2DeductionWouldRun(-10),
            false,
            "The deduction guard in Phase 2 also filters out negatives"
        );
    });

    it("BUG – if Phase-2 guard were absent, a negative deduction would ADD resources", () => {
        // Demonstrates what would happen without the Phase-2 guard:
        let coins = 500;
        const negativeAmount = -100;
        // Simulate the unguarded: profile.coins -= amounts.coins
        coins -= negativeAmount; // coins = 500 - (-100) = 600
        assert.equal(coins, 600, "Removing the Phase-2 guard turns a negative deduct into an addition");
    });

    it("undefined amount triggers neither check (safe — resource is simply not touched)", () => {
        assert.equal(phase1ValidationWouldRun(undefined), false);
        assert.equal(phase2DeductionWouldRun(undefined), false);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 6 — Referral System Self-Referral Check  (SECURITY_AUDIT.md §6)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §6 – Referral system self-referral guard logic", () => {
    /**
     * ReferralService.applyReferralCode checks:
     *   1. refereeProfile.referredBy !== ""   → throws REFERRAL_ALREADY_USED
     *   2. referrerProfile.userId === userId  → throws REFERRAL_SELF_USE
     *
     * These guards are tested as pure conditional logic below.
     * The race-condition vulnerability (concurrent requests bypassing #1) is
     * documented in §1 of the audit and cannot be unit-tested without a live
     * Redis instance; it is noted here for completeness.
     */

    /** Mirrors the "already referred" check in ReferralService */
    function isAlreadyReferred(referredBy: string): boolean {
        return referredBy !== "";
    }

    /** Mirrors the self-referral check in ReferralService */
    function isSelfReferral(referrerUserId: string, refereeUserId: string): boolean {
        return referrerUserId === refereeUserId;
    }

    it("detects an already-referred user (referredBy is non-empty)", () => {
        assert.ok(isAlreadyReferred("some-user-id"));
    });

    it("allows a user who has not yet been referred (referredBy is empty string)", () => {
        assert.equal(isAlreadyReferred(""), false);
    });

    it("detects direct self-referral (same userId)", () => {
        assert.ok(isSelfReferral("user-abc", "user-abc"));
    });

    it("allows a referral from a different user", () => {
        assert.equal(isSelfReferral("user-abc", "user-xyz"), false);
    });

    it("self-referral check is case-sensitive (different casing = different users)", () => {
        // Demonstrates that 'User-ABC' and 'user-abc' are treated as different,
        // which may be exploitable if IDs are stored inconsistently.
        assert.equal(isSelfReferral("User-ABC", "user-abc"), false);
    });

    it("BUG – race-condition window: two concurrent requests both see referredBy='' before either saves", () => {
        // Pure documentation: simulate two in-flight requests both reading
        // the same initial state.
        const refereeBeforeSave = { referredBy: "", userId: "user-1" };

        // Both requests independently evaluate isAlreadyReferred on the same snapshot
        const request1Allowed = !isAlreadyReferred(refereeBeforeSave.referredBy);
        const request2Allowed = !isAlreadyReferred(refereeBeforeSave.referredBy);

        assert.ok(request1Allowed, "request 1 passes the check (expected)");
        assert.ok(request2Allowed, "request 2 also passes the check (race condition — both will apply rewards)");
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Mini-game schema correctness  (SECURITY_AUDIT.md §3)
// ═════════════════════════════════════════════════════════════════════════════

describe("SECURITY_AUDIT §3 – Mini-game schema guards", () => {
    /**
     * Mini-games 2, 3, and 4 require a `userGuess` when the operation is
     * "guess". These tests verify that the schemas enforce this constraint
     * and that the "end" operation (which triggers reward distribution) is
     * not gated behind any additional one-time check at the schema layer —
     * confirming that multi-end attacks (§3.B) must be prevented at the
     * service layer.
     */

    // ── Mini-game 2 (higher / lower) ─────────────────────────────────────

    it("MG2: accepts start/end without userGuess", () => {
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "start" }));
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "end" }));
    });

    it("MG2: rejects guess without userGuess", () => {
        assert.equal(accepts(MINI_GAME_2_SCHEMA, { operation: "guess" }), false);
    });

    it("MG2: accepts guess with valid userGuess values", () => {
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "guess", userGuess: "less" }));
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "guess", userGuess: "greater" }));
    });

    it("MG2: rejects invalid userGuess value", () => {
        assert.equal(accepts(MINI_GAME_2_SCHEMA, { operation: "guess", userGuess: "equal" }), false);
    });

    it("MG2 BUG NOTE – end operation can be sent multiple times (schema has no idempotency guard)", () => {
        // Both of these parse successfully — the schema does not prevent
        // the same "end" being submitted multiple times.  The multi-end
        // exploit documented in §3.B must be fixed in MiniGamesService.
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "end" }));
        assert.ok(accepts(MINI_GAME_2_SCHEMA, { operation: "end" }));
    });

    // ── Mini-game 3 (pick 1-4) ────────────────────────────────────────────

    it("MG3: rejects guess without userGuess", () => {
        assert.equal(accepts(MINI_GAME_3_SCHEMA, { operation: "guess" }), false);
    });

    it("MG3: accepts guess with userGuess in range [1,4]", () => {
        for (const g of [1, 2, 3, 4]) {
            assert.ok(accepts(MINI_GAME_3_SCHEMA, { operation: "guess", userGuess: g }), `MG3 guess ${g} should be valid`);
        }
    });

    it("MG3: rejects out-of-range userGuess values", () => {
        assert.equal(accepts(MINI_GAME_3_SCHEMA, { operation: "guess", userGuess: 0 }), false);
        assert.equal(accepts(MINI_GAME_3_SCHEMA, { operation: "guess", userGuess: 5 }), false);
    });

    // ── Mini-game 4 (rock / paper / scissors) ────────────────────────────

    it("MG4: rejects guess without userGuess", () => {
        assert.equal(accepts(MINI_GAME_4_SCHEMA, { operation: "guess" }), false);
    });

    it("MG4: accepts guess with valid RPS choices", () => {
        for (const g of ["rock", "paper", "scissors"] as const) {
            assert.ok(accepts(MINI_GAME_4_SCHEMA, { operation: "guess", userGuess: g }), `MG4 guess "${g}" should be valid`);
        }
    });

    it("MG4: rejects invalid userGuess string", () => {
        assert.equal(accepts(MINI_GAME_4_SCHEMA, { operation: "guess", userGuess: "fire" }), false);
    });
});
