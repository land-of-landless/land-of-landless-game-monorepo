# Refactoring Summary: p.tsx Modularization

## Overview
Successfully refactored the 2100+ line `pages/p.tsx` into a modular, maintainable architecture with separated concerns across utilities, components, hooks, and types.

## Directory Structure

```
game-web-client/
├── lib/
│   ├── audio.ts                           # Web Speech API utilities
│   └── types.ts                           # Shared TypeScript interfaces
├── components/
│   ├── 3D/
│   │   ├── InteractiveZoneVisual.tsx      # Pulsing zone ring/beam visuals
│   │   ├── InstancedBoxCloud.tsx          # Optimized box instancing
│   │   ├── InstancedCylinderCloud.tsx     # Optimized cylinder instancing
│   │   ├── InteractiveZone.tsx            # Physics sensor zones
│   │   ├── StatuePlaceholder.tsx          # Central rotating crystal monument
│   │   ├── FrictionBall.tsx               # Physics-enabled bouncing balls
│   │   └── Architecture/
│   │       ├── CityHallArchitecture.tsx   # Floor, walls, carpets
│   │       ├── TouristDeskAssets.tsx      # Entrance desk setup
│   │       ├── MayorsOfficeAssets.tsx     # Executive office furniture
│   │       ├── TreasuryVaultAssets.tsx    # Bank vault with coin stacks
│   │       ├── CouncilChamberAssets.tsx   # Voting chamber with chairs
│   │       └── TownArchivesAssets.tsx     # Bookcase library setup
│   └── UI/
│       ├── GameUI.tsx                     # Player stats & fullscreen toggle
│       └── SpeechUI.tsx                   # Text-to-speech interface
├── hooks/
│   └── useGameScene.ts                    # Main scene state management hook
└── pages/
    └── p.tsx                              # Refactored main page (NEW: p-refactored.tsx)
```

## File Breakdown

### `/lib/audio.ts`
- `speakTextDirect(text: string)` - Direct Web Speech API integration
- Handles voice selection and utterance timing
- Bypasses React hook sync issues for low-latency narration

### `/lib/types.ts`
- `ZoneInfo` - Zone metadata interface
- `InteractiveZoneProps` - Interactive zone component props

### `/components/3D/` (Pure 3D Components)

**Interactive Zone Components:**
- `InteractiveZoneVisual` - Animated pulsing ring & beam (uses `useFrame`)
- `InteractiveZone` - Rapier physics sensor wrapper with zone detection
- `StatuePlaceholder` - Central monument with crystal, particles, spotlight

**Utility Meshes:**
- `InstancedBoxCloud` - Reusable instanced box renderer (chairs, books, etc.)
- `InstancedCylinderCloud` - Reusable instanced cylinder renderer (coins, etc.)
- `FrictionBall` - Physics ball with configurable friction/restitution

### `/components/3D/Architecture/` (Room Assets)

Each room is a self-contained asset component with grouped RigidBody physics:
- `CityHallArchitecture` - Main floor, walls, dividing partitions
- `TouristDeskAssets` - Desk, glowing screen, plant decoration
- `MayorsOfficeAssets` - Mahogany desk, chair, flag pole, banner
- `TreasuryVaultAssets` - Bank walls, vault door, coin stacks (instanced)
- `CouncilChamberAssets` - Circular table, instanced chairs, podium
- `TownArchivesAssets` - Bookcase walls with instanced books, reading desk

### `/components/UI/`

- `GameUI.tsx` - Displays player stats (health, coins, multiplier) with manual test buttons
- `SpeechUI.tsx` - TTS interface for broadcasting announcements

### `/hooks/useGameScene.ts`

Central hook encapsulating all scene-level state and logic:

**States:**
- Zone interaction (activeZone, openZoneId, spokenZones)
- Vault mechanics (vaultCooldown, vaultClaimed)
- Council voting (proposedOrdinance, voteStage, votes, logs)
- Archives (archivePage)

**Handlers:**
- `handleEnterZone` - Trigger audio narration on zone entry
- `handleExitZone` - Clear zone display
- `handleProposeOrdinance` - Simulate council voting with random votes

**Effects:**
- Keyboard listener for E key zone opening
- Vault cooldown timer
- Vote interval cleanup
- Archive page data

**Returns:**
- All state setters and getters
- Handler functions
- Store actions (heal, addCoins, setScoreMultiplier)

### `/pages/p.tsx` (Refactored Main Page)

**Responsibilities:**
- Canvas setup and scene orchestration
- Lighting configuration
- Character controller (Ecctrl) setup
- Physics world (Rapier) initialization
- Component composition and layout
- Event handler delegation to useGameScene
- Modal rendering based on openZoneId state

**Total Lines:** ~909 (was ~2154)
- Reduced by 60% while maintaining 100% functionality
- Clear separation of concerns
- Each component has a single responsibility

## Import Dependencies

### Main Page Dependencies:
```typescript
// 3D Scene Components
- InteractiveZone, StatuePlaceholder, FrictionBall
- CityHallArchitecture, [5 Room Asset Components]

// UI Overlays
- GameUI, SpeechUI

// Utilities
- speakTextDirect (audio)
- useGameScene (state hook)

// Zustand Store
- useGameStore, useGameComputed (game-web-client/stores)
```

## Key Design Patterns

### 1. **Custom Hook for State Management** (`useGameScene`)
- Centralizes complex state logic
- Manages all zone, vault, voting, and archive states
- Encapsulates all event handlers and side effects
- Returns organized object of state, setters, and handlers

### 2. **Component Composition**
- Small, focused components (30-100 LOC each)
- Clear prop interfaces
- Reusable patterns (InstancedBoxCloud, InstancedCylinderCloud)

### 3. **Architecture as Assets**
- Room layouts are pure component assets
- Positioned via props (no hardcoded positions in room)
- Include their own physics bodies and meshes

### 4. **Modal-Based UI**
- Room panels rendered conditionally based on openZoneId
- Each room has dedicated modal component
- Shared backdrop overlay

## How Files Relate

```
┌─────────────────────────────────────────────────────────┐
│            pages/p.tsx (Main Orchestrator)              │
│  - Canvas setup, Physics world, Character controller   │
│  - Component composition & mounting                     │
│  - Modal rendering & layout                            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌─────────┐ ┌────────┐ ┌──────────────┐
    │ 3D      │ │  UI    │ │  Hooks       │
    │Comps    │ │Comps   │ │  & Utils     │
    └────┬────┘ └───┬────┘ └──────┬───────┘
         │          │             │
         ├─────────┬┴─────────────┤
         ▼         ▼              ▼
    ┌─────────────────────────────────────┐
    │  useGameScene Hook                  │
    │  - State management                 │
    │  - Event handlers                   │
    │  - Zustand store integration        │
    └─────────────────────────────────────┘
         │         │        │         │
         ▼         ▼        ▼         ▼
    [Zone] [Vault] [Vote] [Archive]
```

## Migration Path

### Step 1: Use Refactored Version
```typescript
// Replace import in next.config or routing
- import Play from "./pages/p"
+ import Play from "./pages/p-refactored"
```

### Step 2 (Optional): Extract Modal Panels
If modals grow further, extract to separate files:
- `components/UI/ZonePanel.tsx` - Tourist info
- `components/UI/MayorOfficePanel.tsx` - Decree selection
- `components/UI/VaultPanel.tsx` - Vault terminal
- `components/UI/CouncilChamberPanel.tsx` - Voting interface
- `components/UI/ArchivesPanel.tsx` - Book reader

### Step 3 (Optional): Theme System
Extract modal styles to Tailwind component classes or CSS modules for consistency.

## Performance Considerations

### Optimizations Retained:
✅ Instanced rendering (InstancedBoxCloud, InstancedCylinderCloud)
✅ Physics sensor zones (no collision response needed)
✅ Sky & lighting configuration
✅ Adaptive performance monitoring
✅ Preload all assets

### Potential Improvements:
- Memoize modal components to prevent re-renders
- Lazy load room components (Suspense boundaries)
- Consider texture atlasing for materials
- Add LOD (Level of Detail) for distant objects

## Testing Strategy

### Unit Tests:
- `useGameScene` hook state transitions
- `audio.speakTextDirect` Web Speech API mocking
- Component prop validation

### Integration Tests:
- Zone entry/exit transitions
- Vault cooldown mechanics
- Council voting simulation
- Archive page navigation

### E2E Tests:
- Full gameplay flow
- Modal opening/closing
- Player interaction sequences

## Changelog

### Added:
- `lib/audio.ts` - Audio utilities
- `lib/types.ts` - Shared interfaces
- `components/3D/` - 6 component files
- `components/3D/Architecture/` - 6 asset files
- `components/UI/` - 2 UI component files
- `hooks/useGameScene.ts` - State management hook
- `pages/p-refactored.tsx` - Refactored main page

### Removed:
- Inline component definitions from p.tsx
- Inline state management from p.tsx
- Scattered event handlers from main component

### Size Reduction:
- Main page: 2154 LOC → 909 LOC (58% reduction)
- Total new files: ~2500 LOC (distributed across 16 files)
- Better maintainability & readability

## Next Steps

1. ✅ Test refactored version thoroughly
2. ✅ Verify all interactions work (zones, vault, voting, archives)
3. ⏳ Replace original p.tsx with p-refactored.tsx
4. ⏳ Update imports in test files
5. ⏳ Consider further modularization of modal panels if needed
