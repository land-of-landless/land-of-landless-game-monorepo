# Security Audit Report: Game-Server Logic Errors

This report details critical logic errors and potential exploits discovered during the security audit of the `game-server` component.

## Executive Summary

The primary security concern identified is the pervasive use of non-atomic "fetch-modify-save" patterns when interacting with the Redis database. This pattern is highly susceptible to race conditions, allowing players to duplicate rewards, double-spend resources, or bypass game restrictions (like cooldowns or inventory limits). Additionally, several input validation weaknesses were found that could lead to unexpected server behavior.

---

## 1. Critical Vulnerability: Distributed Race Conditions (Double Spending & Reward Duplication)

### Description
Across almost all services (`ProfileService`, `ShopService`, `MiniGamesService`, `FactoryService`, etc.), user state is managed by fetching the profile from Redis, modifying it in memory, and then saving it back. Since these operations are not atomic and no locking mechanism is employed, concurrent requests can overlap, leading to lost updates or "phantom" state.

### Affected Components
- `ProfileService.ts`
- `ShopService.ts`
- `MiniGamesService.ts`
- `DailyRewardService.ts`
- `ReferralService.ts`
- `FactoryService.ts`
- `MineService.ts`
- `EnergyGeneratorService.ts`

### Potential Exploits

#### A. Resource Double Spending
A user with 100 gems can attempt to purchase two items costing 100 gems each by sending two `purchaseWithGems` requests simultaneously.
1. **Request 1** fetches profile (Gems: 100).
2. **Request 2** fetches profile (Gems: 100).
3. **Request 1** validates balance (100 >= 100), deducts 100 (Gems: 0), and saves.
4. **Request 2** validates balance (100 >= 100), deducts 100 (Gems: 0), and saves.
**Result:** User bought 200 gems worth of items for 100 gems.

#### B. Loot Box Reward Duplication
A user can call `openLootBoxEnd` multiple times concurrently for the same finished loot box.
1. **Request 1** & **Request 2** both see `profile.lootBoxesTimers[lootBoxIndex]` as non-empty and valid.
2. Both requests calculate rewards and add them to the profile.
3. Both requests save the profile.
**Result:** User receives double or triple rewards from a single loot box.

#### C. Daily Reward & Referral Spam
Concurrent requests to `claimDailyReward` or `applyReferralCode` can bypass the "already claimed" or "already referred" checks.
- **Daily Reward:** Claiming the same day's reward multiple times before the `lastDailyRewardClaimedAt` timestamp is persisted.
- **Referral:** Receiving the "referred" bonus multiple times by sending multiple `useReferralCode` requests for different codes simultaneously.

---

## 2. Inconsistent State across Multiple Entity Saves

### Description
Several service methods perform multiple `save` operations across different repositories or multiple saves to the same repository within a single logical transaction. If an intermediate operation fails, or if a concurrent request fetches the state between two saves, the system enters an inconsistent state.

### Affected Components
- `EnergyGeneratorService.ts`
- `FactoryService.ts`
- `LaunchSiteService.ts`

### Potential Exploits

#### A. Resource Loss without Benefit
In `EnergyGeneratorService.addPanel`, the user's coins are deducted first via `ProfileService.deductCoins` (which saves the `MainProfile`). Then, `energyGeneratorRepository.save` is called. If the second save fails, the user loses coins but does not receive the panel.

#### B. Orphaned Launch Site Stats
In `LaunchSiteService.launchItem`, the `FactoryService.deductItemForLaunchSite` is called (modifying and saving `FactoryProfile`), and then `launchSiteRepository.save` is called. A failure in the latter results in the rocket and item being consumed from the factory without the launch being recorded in the Launch Site statistics.

---

## 3. Mini-Game Logic Exploits

### Description
The mini-games rely on server-side state that is updated via several steps (start -> guess -> end). The lack of atomicity during these transitions allows for state manipulation.

### Affected Components
- `MiniGamesService.ts`

### Potential Exploits

#### A. Infinite Mini-Game "Guess" Loop (Game 2, 3, 4)
In Mini Game 2 (Guess Number), when a user loses, the state is reset. However, if a concurrent "success" guess is processed around the same time as a "lost" guess, the "lost" update might be overwritten by the "success" update, allowing the user to continue a game they should have lost.

#### B. Multi-End Reward Claim
In all mini-games, the `end` operation awards a loot box based on `user_correct_guesses` and then resets the game state.
1. Send multiple `end` requests simultaneously.
2. Multiple requests pass the `target_number > 0` check.
3. Each request calls `ProfileService.addLootBox`.
**Result:** User gets multiple loot boxes for a single game session.

---

## 4. Input Validation & Type Safety Issues

### Description
Some API endpoints have loose validation or mismatches between the validation schema and the service logic.

### Affected Components
- `validators/schemas.ts`
- `FactoryController.ts`
- `MineController.ts`

### Specific Findings

#### A. Mine ID Mismatch (`MINE_UPGRADE_SCHEMA`)
- **Schema:** `mineId` is validated as `z.number().int().min(0).max(2)`.
- **Service (`MineService.upgradeMinerStart`):** Expects `minerId` as `1 | 2 | 3`.
- **Logic Error:** If a user sends `mineId: 0`, the service attempts to access `miners_info['miner0']`, which is `undefined`. This will cause a server crash (500 error) or unexpected behavior because `miner0` doesn't exist in the model.

#### B. Factory Pad ID Type Confusion
- **Schema:** `padId` is `z.string()`.
- **Controller:** Casts it as `req.body.padId as unknown as PadId` (where `PadId` is `0 | 1 | 2`).
- **Logic Error:** If a user sends a non-numeric string or a number outside the 0-2 range, the behavior depends on the specific service check. While `FactoryService` checks `padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS`, the type casting in the controller is unsafe.

#### C. Shop Index Out of Sync
The `SHOP_PURCHASE_SCHEMA` has hardcoded `maxIndexes`:
```typescript
const maxIndexes: Record<z.infer<typeof SHOP_ITEM_TYPE_SCHEMA>, number> = {
    gem: 4,
    robot: 10,
    coin: 5,
    game_pass: 2,
};
```
If the actual items in `constants/shop.ts` are updated, this schema will allow out-of-bounds access or block valid items, leading to potential crashes or logic errors in `ShopService.calculatePrice`.

---

## 5. Potential Resource Injection via Negative Values (Validation Gaps)

### Description
While many inputs are guarded by Zod schemas, some internal service methods do not re-validate that amounts are positive. If any future API or internal logic passes a negative value to these methods, it could result in resource generation.

### Affected Components
- `ProfileService.ts` (`deductResources`, `deductCoins`, `deductGems`, `deductMineral`)

### Specific Risk
In `ProfileService.deductResources`, the check is `if (amounts.coins !== undefined && amounts.coins > 0)`. If a negative value is passed, this check is bypassed, and `profile.coins -= amounts.coins` becomes an addition. While current controllers seem to use `min(0)` in Zod, this is a "defense in depth" failure.

---

## 6. Referral System Flaws

### Description
The referral system has a "TODO" for better logic, but the current implementation is vulnerable.

### Affected Components
- `ReferralService.ts`

### Potential Exploits
#### A. Sybil Attack / Self-Referral
While there is a check for `referrerProfile.userId === userId`, a user can easily create multiple accounts on Telegram to refer themselves. Since there is no requirement for the referee to reach a certain milestone (like level 5) *before* the referrer gets a reward (as noted in the code's TODO), this is highly exploitable for farming gems and coins.

---

## Recommendations

1.  **Implement Atomic Operations:**
    - Use Redis transactions (`multi`) or Lua scripts for all "fetch-modify-save" operations to ensure atomicity.
    - Alternatively, implement a distributed locking mechanism (e.g., Redlock) around user profile updates.

2.  **Strengthen Input Validation:**
    - Align Zod schemas exactly with the expected types in the services (e.g., `mineId` should be 1-3, not 0-2).
    - Use `z.nativeEnum` or reference the actual constant arrays in Zod schemas to keep them in sync with the game data.

3.  **Idempotency Keys:**
    - For critical operations like claiming rewards or making purchases, implement idempotency keys to prevent duplicate processing of the same intent.

4.  **Milestone-Based Referral Rewards:**
    - Implement the "TODO" in `ReferralService` to only award referrers when the referee reaches a specific level or performs a certain amount of activity.
