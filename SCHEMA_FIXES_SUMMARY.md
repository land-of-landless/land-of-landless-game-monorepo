# 🔧 Database Schema Foreign Key Fixes - Complete Summary

## Overview

All PostgreSQL schemas have been updated to follow best practices with proper foreign keys, cascade deletes, and Drizzle ORM relations. The primary key of `mainProfiles` (user_id) was **not modified** as requested.

---

## Files Modified

### 1. ✅ `src/models/postgres/billing.ts`
**Issues Found & Fixed:**
- ❌ `billings.user_id` had no FK to `mainProfiles`
- ❌ `invoices` references were missing `onDelete: "cascade"`
- ❌ `donations` references were missing `onDelete: "cascade"`

**Changes Made:**
```typescript
// BEFORE:
user_id: varchar("user_id", { length: 255 }).primaryKey(),

// AFTER:
user_id: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
```

**Added Relations:**
- `billings` → `mainProfiles` (one-to-one via user_id)
- `invoices` → `mainProfiles` (one-to-many via user_id)
- `donations` → `mainProfiles` (one-to-many via user_id)

**Result:**
- All FK references now have `{ onDelete: "cascade" }`
- When user is deleted, all their billing records, invoices, and donations are automatically removed
- Relations established for Drizzle ORM querying

---

### 2. ✅ `src/models/postgres/mine.ts`
**Issues Found & Fixed:**
- ❌ `miners.user_id` had no FK to `mainProfiles`
- ⚠️ `miners.id` used deprecated `serial()` instead of `generatedAlwaysAsIdentity()`

**Changes Made:**
```typescript
// BEFORE:
id: serial("id").primaryKey(),
user_id: varchar("user_id", { length: 255 }).notNull(),

// AFTER:
id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
user_id: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
```

**Why `generatedAlwaysAsIdentity()`?**
- ✅ Modern PostgreSQL best practice (replaces deprecated SERIAL)
- ✅ More control over identity behavior
- ✅ Cleaner migrations
- ✅ Better for sequences across distributed systems

**Added Relations:**
- `miners` → `mainProfiles` (one-to-many via user_id)

**Result:**
- Modern auto-increment pattern
- Cascade delete when user is deleted
- Full relational integrity

---

### 3. ✅ `src/models/postgres/energyGenerator.ts`
**Issues Found & Fixed:**
- ❌ `energyGenerators.user_id` had no FK to `mainProfiles`
- ❌ Missing relations entirely

**Changes Made:**
```typescript
// BEFORE:
user_id: varchar("user_id", { length: 255 }).primaryKey(),

// AFTER:
user_id: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
```

**Added Relations:**
- `energyGenerators` → `mainProfiles` (one-to-one via user_id)

**Result:**
- FK constraint ensures data integrity
- Cascade delete on user deletion
- Drizzle relations established

---

### 4. ✅ `src/models/postgres/miniGames.ts`
**Issues Found & Fixed:**
- ❌ `miniGames.user_id` had no FK to `mainProfiles`
- ❌ Missing relations entirely

**Changes Made:**
```typescript
// BEFORE:
user_id: varchar("user_id", { length: 255 }).primaryKey(),

// AFTER:
user_id: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
```

**Added Relations:**
- `miniGames` → `mainProfiles` (one-to-one via user_id)

**Result:**
- FK constraint ensures user exists
- Cascade delete on user deletion
- Drizzle relations established

---

### 5. ✅ `src/models/postgres/stats.ts`
**Issues Found & Fixed:**
- ❌ `stats.user_id` had no FK to `mainProfiles` (critical!)
- ❌ `lootBoxesByType` had no `onDelete: "cascade"`
- ❌ `launchesByItem` had no `onDelete: "cascade"`
- ❌ Child tables were missing direct FK to `mainProfiles`

**Changes Made:**
```typescript
// BEFORE:
export const stats = pgTable("stats", {
    user_id: varchar("user_id", { length: 255 }).primaryKey(),
    // ...
});

export const lootBoxesByType = pgTable("loot_boxes_by_type", {
    // ...
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.user_id),

// AFTER:
export const stats = pgTable("stats", {
    user_id: varchar("user_id", { length: 255 })
        .primaryKey()
        .references(() => mainProfiles.user_id, { onDelete: "cascade" }),
    // ...
});

export const lootBoxesByType = pgTable("loot_boxes_by_type", {
    // ...
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => stats.user_id, { onDelete: "cascade" }),
```

**Added Relations:**
- `stats` → `mainProfiles` (one-to-one via user_id)
- `lootBoxesByType` → `mainProfiles` (one-to-many via user_id)
- `launchesByItem` → `mainProfiles` (one-to-many via user_id)

**Result:**
- All tables properly cascade-delete when user is deleted
- Dual FK paths to mainProfiles for flexibility
- Full relational integrity

---

## Schema Integrity Summary

### Foreign Key Structure (After Fixes)

```
mainProfiles (user_id: PK)
    ├── billings (user_id: FK, cascade)
    │   ├── invoices (user_id: FK, cascade)
    │   └── donations (user_id: FK, cascade)
    ├── labs (user_id: FK, cascade) ✅ Already correct
    ├── launchSites (user_id: FK, cascade) ✅ Already correct
    ├── satellites → launchSites ✅ Already correct
    ├── factories (user_id: FK, cascade) ✅ Already correct
    ├── factoryBuilderPads → factories ✅ Already correct
    ├── inventories (user_id: FK, cascade) ✅ Already correct
    ├── miners (user_id: FK, cascade) ✅ FIXED
    ├── energyGenerators (user_id: FK, cascade) ✅ FIXED
    ├── stats (user_id: FK, cascade) ✅ FIXED
    │   ├── lootBoxesByType (user_id: FK, cascade)
    │   └── launchesByItem (user_id: FK, cascade)
    └── miniGames (user_id: FK, cascade) ✅ FIXED
```

### Data Integrity Guarantees

✅ **Cascade Delete**: When a user is deleted, ALL their related data is automatically removed
- Prevents orphaned records
- Maintains referential integrity
- Single delete operation cascades through entire tree

✅ **Foreign Key Constraints**: Database enforces relationships
- Cannot create records without valid user_id
- Cannot delete users with active constraints (cascades instead)
- Data consistency guaranteed at database level

✅ **Drizzle Relations**: Full ORM support
```typescript
// Now you can do:
const userWithStats = await db.query.stats.findFirst({
    where: eq(stats.user_id, userId),
    with: {
        profile: true,
        lootBoxesByType: true,
        launchesByItem: true,
    },
});

// Automatic relation joins:
const users = await db.query.mainProfiles.findMany({
    with: {
        billings: {
            with: {
                invoices: true,
                donations: true,
            },
        },
        miners: true,
        stats: true,
    },
});
```

---

## Key PostgreSQL Best Practices Applied

### 1. ✅ Foreign Keys with `onDelete: "cascade"`
Every child table explicitly references parent:
```typescript
.references(() => parentTable.column, { onDelete: "cascade" })
```

### 2. ✅ `generatedAlwaysAsIdentity()` for Auto-Increment
Modern replacement for deprecated `SERIAL`:
```typescript
id: integer("id").primaryKey().generatedAlwaysAsIdentity()
```

**Why it's better:**
- Part of SQL standard (not PostgreSQL-specific)
- Better control over sequence behavior
- Cleaner schema introspection
- Recommended by PostgreSQL docs since v12

### 3. ✅ Complete Drizzle Relations
Every FK now has a corresponding relation:
```typescript
// In parent table:
export const tableRelations = relations(table, ({ one, many }) => ({
    children: many(childTable),
}));

// In child table:
export const childRelations = relations(childTable, ({ one }) => ({
    parent: one(parentTable, {
        fields: [childTable.parent_id],
        references: [parentTable.id],
    }),
}));
```

### 4. ✅ Nullable vs Non-Nullable
- Primary/Foreign keys: `.notNull()` always present
- Optional references: Columns are nullable with comment explaining why

---

## Migration Instructions

### Step 1: Backup Database
```bash
pg_dump land_of_landless > backup_$(date +%s).sql
```

### Step 2: Generate Drizzle Migration
```bash
npm run db:generate
```

This will create migration files comparing your schema definitions to the database.

### Step 3: Review Generated Migration
```bash
cat drizzle/[timestamp]_*.sql
```

Expected changes:
```sql
-- Add FKs to billing
ALTER TABLE billings 
ADD CONSTRAINT billings_user_id_fk 
FOREIGN KEY (user_id) REFERENCES main_profiles(user_id) ON DELETE CASCADE;

-- Change miners.id from SERIAL to GENERATED ALWAYS AS IDENTITY
ALTER TABLE miners 
ALTER COLUMN id SET GENERATED ALWAYS AS IDENTITY;

-- Add FKs and cascade to child tables
ALTER TABLE invoices 
ALTER CONSTRAINT invoices_user_id_fk 
ADD CONSTRAINT ... ON DELETE CASCADE;

-- Similar for: donations, miners, energyGenerators, stats, lootBoxesByType, launchesByItem, miniGames
```

### Step 4: Apply Migration
```bash
npm run db:migrate
```

### Step 5: Verify Constraints
```bash
# In PostgreSQL shell:
\d billing_invoices
\d miners
\d energy_generators
# Should show CASCADE delete rules
```

---

## Testing Checklist

After migration, verify:

- [ ] All FK constraints exist: `SELECT * FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY';`
- [ ] Cascade rules are set: `SELECT * FROM information_schema.referential_constraints;`
- [ ] `miners.id` uses IDENTITY: `\d miners` shows "GENERATED ALWAYS AS IDENTITY"
- [ ] No orphaned records: `SELECT user_id FROM stats WHERE user_id NOT IN (SELECT user_id FROM main_profiles);` (should return 0 rows)
- [ ] Relations work in code: Test Drizzle queries with `with:` clauses

---

## What Wasn't Changed (As Requested)

✅ **mainProfiles.user_id** - Left as primary key (user_id: varchar)
✅ **launchSites** - Already correct, no changes needed
✅ **labs** - Already correct, no changes needed
✅ **factory** - Already correct, no changes needed

---

## Summary of Changes

| File | Issue | Fix | Status |
|------|-------|-----|--------|
| billing.ts | No FK to mainProfiles | Added FK + cascade | ✅ Fixed |
| mine.ts | No FK, used SERIAL | Added FK, changed to generatedAlwaysAsIdentity | ✅ Fixed |
| energyGenerator.ts | No FK | Added FK + cascade + relations | ✅ Fixed |
| miniGames.ts | No FK | Added FK + cascade + relations | ✅ Fixed |
| stats.ts | No FK, missing cascade | Added FK, cascade, relations to all children | ✅ Fixed |

**Result:** Full referential integrity with cascade deletes throughout the entire database schema. ✨

---

Generated: 2025-06-23 | Land of Landless Game Server
