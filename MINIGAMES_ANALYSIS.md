# MiniGames Logic Analysis - Schema/DAO/Service Mismatch

## 🔴 CRITICAL ISSUE IDENTIFIED

The MiniGames implementation has a **severe schema mismatch** between what the DAO expects and what actually exists in the database schema.

---

## Problem Breakdown

### Current State:

**Schema (`miniGames.ts`):**
```typescript
export const miniGames = pgTable("mini_games", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    // Arrays stored directly in columns:
    mg2_remaining_numbers: integer("mg2_remaining_numbers")
        .array()
        .notNull()
        .default([0, 32]),
    mg3_boxes_state: integer("mg3_boxes_state")
        .array()
        .notNull()
        .default([]),
    // ... other fields
});
```

**DAO (`miniGamesDAO.ts`):**
```typescript
import {
    miniGames,
    mg2RemainingNumbers,      // ❌ DOESN'T EXIST
    mg3BoxesState,            // ❌ DOESN'T EXIST
} from "@/models/postgres/schema.js";

// Tries to insert into non-existent tables:
await tx.insert(mg2RemainingNumbers).values(...)
await tx.insert(mg3BoxesState).values(...)
```

---

## Issues

### 1. 🔴 Missing Table Definitions
The DAO tries to import `mg2RemainingNumbers` and `mg3BoxesState` tables that **don't exist** in the schema.

### 2. 🔴 Type Mismatch
- **Schema:** Arrays stored as `integer[]` in single columns
- **DAO:** Expects separate tables for arrays

### 3. 🔴 Create Operation Breaks
`createMiniGamesProfile()` will fail when trying to insert into non-existent tables.

### 4. 🔴 Find Operation Breaks
`findMiniGamesProfileByUserId()` tries to query non-existent tables with `mg2RemainingNumbers` and `mg3BoxesState`.

### 5. 🔴 Save Operation Breaks
`saveMiniGamesProfile()` deletes and recreates data in non-existent tables.

---

## Solution Options

### Option A: Use Schema Arrays (RECOMMENDED)
- **Pros:** Simpler, fewer queries, matches current schema
- **Cons:** Less granular control
- **Recommendation:** ✅ Use this approach

### Option B: Create Separate Tables
- **Pros:** More normalized, granular control
- **Cons:** More complex, more queries, requires schema migration
- **Recommendation:** ❌ Overkill for this use case

---

## Required Changes

### 1. DAO File: `mainProfile.ts`
**Status:** ✅ Already fixed (uses `inArray()` for bulk operations)

### 2. Schema File: `miniGames.ts`
**Status:** ✅ Correct (arrays in columns)

### 3. DAO File: `miniGamesDAO.ts`
**Status:** 🔴 NEEDS FIX

**Fix:**
- Remove imports of non-existent tables
- Simplify to work with array columns directly
- Use TypeScript types properly
- Add missing methods (createMiniGamesProfile was not working)

### 4. Service File: `MiniGamesService.ts`
**Status:** ✅ Correct (logic is sound, depends on DAO)

---

## Summary of Fixes Needed

| File | Issue | Fix |
|------|-------|-----|
| `miniGamesDAO.ts` | Imports non-existent tables | Remove mg2RemainingNumbers, mg3BoxesState imports |
| `miniGamesDAO.ts` | Try to insert into non-existent tables | Use direct array column updates |
| `miniGamesDAO.ts` | Type safety missing | Add proper NewMiniGame types |
| `miniGamesDAO.ts` | Return types unclear | Add clear return types |
| `miniGamesDAO.ts` | Error handling inconsistent | Make consistent with MainProfileDAO pattern |

---

## Implementation Plan

1. ✅ Rewrite `MiniGamesDAO` to work with array columns
2. ✅ Add proper TypeScript types
3. ✅ Add missing methods (e.g., update individual game states)
4. ✅ Follow MainProfileDAO pattern for consistency
5. ✅ Add comprehensive error logging
6. ✅ Test with service layer
