# 🗂️ Schema Quick Reference - After Fixes

## What Changed

5 schema files have been updated with proper foreign keys and relations.

## Files Modified ✅

| File | Change |
|------|--------|
| `src/models/postgres/billing.ts` | Added FK to mainProfiles, cascade deletes, relations |
| `src/models/postgres/mine.ts` | Added FK to mainProfiles, changed SERIAL to generatedAlwaysAsIdentity, relations |
| `src/models/postgres/energyGenerator.ts` | Added FK to mainProfiles, relations |
| `src/models/postgres/miniGames.ts` | Added FK to mainProfiles, relations |
| `src/models/postgres/stats.ts` | Added FK to mainProfiles, cascade deletes, relations for all children |

## Next Step: Apply Migrations

```bash
# Generate migration based on schema changes
npm run db:generate

# Review the migration (optional)
cat drizzle/[timestamp]_*.sql

# Apply to database
npm run db:migrate
```

## Key Improvements

### ✅ Every table now has proper FKs
- Billings → mainProfiles
- Miners → mainProfiles
- EnergyGenerators → mainProfiles
- MiniGames → mainProfiles
- Stats → mainProfiles
- All child tables use `onDelete: "cascade"`

### ✅ Modern auto-increment pattern
- Replaced `serial()` with `generatedAlwaysAsIdentity()`
- Matches PostgreSQL best practices
- Works better with migrations

### ✅ Full Drizzle ORM support
- All relations defined
- Can use `.with()` in queries
- Type-safe joins

## What Wasn't Changed (Preserved)

- `mainProfiles.user_id` primary key structure
- `labs`, `launchSites`, `factory` schemas (already correct)

## Data Integrity Benefits

When you delete a user:
```
user deleted → all billings deleted → all invoices & donations deleted
           → all miners deleted
           → all energyGenerators deleted
           → all stats deleted → all lootBoxesByType & launchesByItem deleted
           → all miniGames deleted
```

All automatic at database level (cascade delete).

## Testing After Migration

```bash
# Verify FK constraints exist
psql -c "SELECT * FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY';"

# Verify no orphaned records
psql -c "SELECT user_id FROM stats WHERE user_id NOT IN (SELECT user_id FROM main_profiles);"
# (should return 0 rows)

# Test Drizzle relations work
# In your code, try:
const userWithStats = await db.query.stats.findFirst({
    where: eq(stats.user_id, userId),
    with: {
        profile: true,
        lootBoxesByType: true,
    },
});
```

---

For detailed information, see: `SCHEMA_FIXES_SUMMARY.md`
