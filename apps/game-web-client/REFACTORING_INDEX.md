# Refactoring Index: Complete File Listing

## Created Files Summary (17 total)

### Utility Files (2 files)

| File | Purpose | Key Exports |
|------|---------|-------------|
| `lib/audio.ts` | Web Speech API wrapper | `speakTextDirect()` |
| `lib/types.ts` | TypeScript interfaces | `ZoneInfo`, `InteractiveZoneProps` |

### 3D Components (6 files)

| File | Purpose | Component Name |
|------|---------|-----------------|
| `components/3D/InteractiveZoneVisual.tsx` | Pulsing zone indicators | `InteractiveZoneVisual` |
| `components/3D/InstancedBoxCloud.tsx` | Optimized box instancing | `InstancedBoxCloud` |
| `components/3D/InstancedCylinderCloud.tsx` | Optimized cylinder instancing | `InstancedCylinderCloud` |
| `components/3D/InteractiveZone.tsx` | Physics sensor zones | `InteractiveZone` |
| `components/3D/StatuePlaceholder.tsx` | Central monument | `StatuePlaceholder` |
| `components/3D/FrictionBall.tsx` | Physics balls | `FrictionBall` |

### Architecture Components (6 files)

| File | Purpose | Component Name | Includes |
|------|---------|-----------------|----------|
| `components/3D/Architecture/CityHallArchitecture.tsx` | Main structure | `CityHallArchitecture` | Floor, walls, carpets |
| `components/3D/Architecture/TouristDeskAssets.tsx` | Entrance desk | `TouristDeskAssets` | Desk, screen, plant |
| `components/3D/Architecture/MayorsOfficeAssets.tsx` | Executive office | `MayorsOfficeAssets` | Desk, chair, flag |
| `components/3D/Architecture/TreasuryVaultAssets.tsx` | Vault room | `TreasuryVaultAssets` | Walls, door, coin stacks |
| `components/3D/Architecture/CouncilChamberAssets.tsx` | Voting chamber | `CouncilChamberAssets` | Table, chairs, podium |
| `components/3D/Architecture/TownArchivesAssets.tsx` | Library | `TownArchivesAssets` | Bookcases, desk, books |

### UI Components (2 files)

| File | Purpose | Component Name | State Managed |
|------|---------|-----------------|---------------|
| `components/UI/GameUI.tsx` | Stats display | `GameUI` | Uses `useGameStore` |
| `components/UI/SpeechUI.tsx` | TTS interface | `SpeechUI` | Text, voices, playback |

### State Management (1 file)

| File | Purpose | Hook Name | State Count |
|------|---------|-----------|------------|
| `hooks/useGameScene.ts` | Scene orchestration | `useGameScene` | 11 states + 3 handlers |

### Main Page (1 file)

| File | Purpose | Component | LOC | Change |
|------|---------|-----------|-----|--------|
| `pages/p-refactored.tsx` | Main game page | `Play` | ~909 | -58% from original |

### Documentation (1 file)

| File | Purpose |
|------|---------|
| `REFACTORING_SUMMARY.md` | Comprehensive refactoring guide |

---

## File Dependencies Graph

```
UTILITY LAYER (lib/)
├── audio.ts
└── types.ts

COMPONENT LAYER (components/)
├── 3D/
│   ├── InteractiveZoneVisual.tsx
│   ├── InstancedBoxCloud.tsx ←── used by Architecture
│   ├── InstancedCylinderCloud.tsx ←── used by TreasuryVault
│   ├── InteractiveZone.tsx ←── used by main page
│   ├── StatuePlaceholder.tsx ←── used by main page
│   ├── FrictionBall.tsx ←── used by main page
│   └── Architecture/
│       ├── CityHallArchitecture.tsx ←── main page
│       ├── TouristDeskAssets.tsx ←── main page
│       ├── MayorsOfficeAssets.tsx ←── main page
│       ├── TreasuryVaultAssets.tsx ←── main page
│       ├── CouncilChamberAssets.tsx ←── main page
│       └── TownArchivesAssets.tsx ←── main page
└── UI/
    ├── GameUI.tsx ←── main page, uses useGameStore
    └── SpeechUI.tsx ←── main page, uses rooks

HOOK LAYER (hooks/)
└── useGameScene.ts ←── main page
    └── imports: speakTextDirect, useGameStore, ZoneInfo

MAIN PAGE (pages/)
└── p-refactored.tsx
    ├── imports 6 3D components
    ├── imports 6 Architecture components
    ├── imports 2 UI components
    ├── imports useGameScene hook
    └── imports audio utilities
```

## Import Relationships

### p-refactored.tsx Imports (16 imports)

**3D Components:**
```typescript
import { InteractiveZoneVisual } from "../components/3D/InteractiveZoneVisual";
import { InteractiveZone } from "../components/3D/InteractiveZone";
import { StatuePlaceholder } from "../components/3D/StatuePlaceholder";
import { FrictionBall } from "../components/3D/FrictionBall";
```

**Architecture Components:**
```typescript
import { CityHallArchitecture } from "../components/3D/Architecture/CityHallArchitecture";
import { TouristDeskAssets } from "../components/3D/Architecture/TouristDeskAssets";
import { MayorsOfficeAssets } from "../components/3D/Architecture/MayorsOfficeAssets";
import { TreasuryVaultAssets } from "../components/3D/Architecture/TreasuryVaultAssets";
import { CouncilChamberAssets } from "../components/3D/Architecture/CouncilChamberAssets";
import { TownArchivesAssets } from "../components/3D/Architecture/TownArchivesAssets";
```

**UI Components:**
```typescript
import { GameUI } from "../components/UI/GameUI";
import { SpeechUI } from "../components/UI/SpeechUI";
```

**Utilities:**
```typescript
import { speakTextDirect } from "../lib/audio";
import { useGameScene } from "../hooks/useGameScene";
```

---

## Component Statistics

### Line Count by Category

| Category | File Count | Total LOC | Avg per File |
|----------|-----------|----------|--------------|
| Utilities | 2 | ~50 | 25 |
| 3D Components | 6 | ~450 | 75 |
| Architecture | 6 | ~550 | 92 |
| UI Components | 2 | ~220 | 110 |
| Hooks | 1 | ~200 | 200 |
| Main Page | 1 | ~909 | 909 |
| **TOTAL** | **18** | **~2,379** | **132** |

Original `p.tsx`: ~2,154 LOC  
Refactored `p-refactored.tsx`: ~909 LOC  
Additional files: ~1,470 LOC  
**Net benefit:** Better organization, clearer separation of concerns

---

## Component Prop Interfaces

### 3D Components Props

**InteractiveZoneVisual**
```typescript
{
  radius: number;
  color: string;
}
```

**InstancedBoxCloud**
```typescript
{
  items: Array<{position, rotation?, scale?}>;
  baseSize: [number, number, number];
  color: string;
}
```

**InstancedCylinderCloud**
```typescript
{
  items: Array<{position, rotation?, scale?}>;
  baseArgs: [number, number, number, number?];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}
```

**InteractiveZone**
```typescript
{
  id: string;
  position: [number, number, number];
  radius?: number;
  color?: string;
  title: string;
  description: string;
  actionText: string;
  speechText: string;
  onEnterZone: (zone: ZoneInfo) => void;
  onExitZone: (id: string) => void;
}
```

**StatuePlaceholder**
```typescript
{
  position: [number, number, number];
}
```

**FrictionBall**
```typescript
{
  position: [number, number, number];
  color?: string;
  radius?: number;
  friction?: number;
  restitution?: number;
  emissiveIntensity?: number;
}
```

### Architecture Components Props

All architecture components follow the same pattern:
```typescript
{
  position: [number, number, number];
}
```

### UI Components Props

**GameUI**
```typescript
{
  isFullscreenEnabled: boolean;
  toggleFullscreen: () => void;
  isFullscreenAvailable: boolean;
}
```

**SpeechUI**
- No props (manages internal state)

---

## State Management Structure (useGameScene)

### Zone Management (3 states)
- `activeZone: ZoneInfo | null`
- `openZoneId: string | null`
- `spokenZones: Record<string, boolean>`

### Vault System (2 states)
- `vaultCooldown: number`
- `vaultClaimed: boolean`

### Council Voting (5 states)
- `proposedOrdinance: string | null`
- `voteStage: "idle" | "voting" | "finished"`
- `yesVotes: number`
- `noVotes: number`
- `voteLogs: string[]`

### Archives (1 state)
- `archivePage: number`

### Effects (3)
1. Keyboard listener for zone opening
2. Vault cooldown timer
3. Vote interval cleanup

### Handlers (3)
1. `handleEnterZone(zone: ZoneInfo)`
2. `handleExitZone(id: string)`
3. `handleProposeOrdinance(name: string)`

---

## Testing Checklist

- [ ] Import all new files and verify no type errors
- [ ] Run game and verify canvas renders
- [ ] Test zone entry/exit with audio narration
- [ ] Test vault cooldown and claim mechanics
- [ ] Test council voting simulation
- [ ] Test archive page navigation
- [ ] Test mayor's office decree selection
- [ ] Test tourist guide modal
- [ ] Test game stats display
- [ ] Test TTS broadcast functionality
- [ ] Test fullscreen toggle
- [ ] Verify no console errors
- [ ] Verify no memory leaks (check in DevTools)

---

## Migration Checklist

- [ ] Backup original `pages/p.tsx`
- [ ] Create `pages/p-refactored.tsx` (DONE)
- [ ] Create `lib/` directory (DONE)
- [ ] Create `components/3D/` directory (DONE)
- [ ] Create `components/3D/Architecture/` directory (DONE)
- [ ] Create `components/UI/` directory (DONE)
- [ ] Create `hooks/` directory (DONE)
- [ ] Update routing if using file-based routing
- [ ] Test in development environment
- [ ] Test in production build
- [ ] Update any imports in test files
- [ ] Update any imports in other pages
- [ ] Delete original `pages/p.tsx` (after verification)
- [ ] Update documentation/README

---

## Future Modularization Opportunities

### Phase 2: Modal Component Extraction
Extract room interaction modals:
- `components/UI/TouristPanel.tsx`
- `components/UI/MayorPanel.tsx`
- `components/UI/VaultPanel.tsx`
- `components/UI/CouncilPanel.tsx`
- `components/UI/ArchivesPanel.tsx`

### Phase 3: Theme System
Create theme/styling system:
- `styles/modals.css`
- `styles/colors.ts`
- `styles/tailwind-components.css`

### Phase 4: Animation Utilities
Extract animation helpers:
- `lib/animations.ts` - useFrame logic
- `lib/geometry.ts` - Shape generation
- `lib/physics.ts` - Physics constants

---

**Status:** ✅ Complete and ready for testing
**Total Files Created:** 17
**Total LOC Added:** ~2,379
**Original File Reduced By:** 58%
