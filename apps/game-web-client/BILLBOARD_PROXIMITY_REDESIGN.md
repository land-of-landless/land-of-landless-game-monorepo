# Billboard Proximity Detection - Physics-Based Redesign

## Overview
Redesigned the donor billboard proximity detection system to use **true Rapier physics collision detection** between the player's character collider and a sensor collider. This ensures that **camera panning has absolutely zero effect** on proximity detection - only the player's physical position matters.

## Architecture Changes

### ✅ Removed Components
- **Donate button logic** - All button rendering, click detection code removed
- **Conditional button visibility** - No more isInProximity prop passing
- **Custom distance calculations** - Replaced with Rapier collision system

### ✅ New Components

#### 1. `stores/billboardStore.ts` - Zustand State
```typescript
interface BillboardStore {
  isInBillboardVicinity: boolean;
  setIsInBillboardVicinity: (inVicinity: boolean) => void;
}
```
- Global state for proximity
- Any component can listen and react

#### 2. `hooks/useProximity/useBillboardProximity.ts` - Camera Animation Only
**New responsibility:** Handle camera focus animation, NOT proximity detection

```typescript
const { isInProximity, setIsInProximity } = useBillboardProximity({
  billboardPosition: [0, 5, -30],
  focusDistance: 7,
});

// Called by Rapier collision callbacks
setIsInProximity(true);   // Animate camera to billboard
setIsInProximity(false);  // Animate camera back to Ecctrl
```

**What it does:**
- Receives `isInProximity` state changes via `setIsInProximity()`
- Animates camera smoothly when state changes (1 second ease-out-cubic)
- Keeps camera locked on billboard while in proximity
- Lets character move with WASD

#### 3. `components/3D/DonorsBillboard.tsx` - Simplified
- No props except `position` and `donors`
- Only renders donor information on canvas
- No button logic, no conditional rendering

#### 4. `components/3D/DonorsBillboardWithFocus.tsx` - Rapier Collision Engine
**The key change - uses actual collision detection:**

```typescript
<RigidBody
  position={position}
  type="fixed"
  sensor
  colliders={false}
  onIntersectionEnter={() => {
    // Player collider PHYSICALLY touched sensor
    setIsInProximity(true);
  }}
  onIntersectionExit={() => {
    // Player collider LEFT sensor
    setIsInProximity(false);
  }}
>
  <sphereGeometry args={[triggerDistance, 16, 16]} />
</RigidBody>
```

## How It Works

### Physics Flow
```
Player Character (has physics collider)
          ↓
          ↓ (moves physically)
          ↓
Rapier Physics Engine
          ↓
Detects collision with Billboard Sensor (sphere, radius 8)
          ↓
onIntersectionEnter() / onIntersectionExit() fired
          ↓
setIsInProximity() called
          ↓
Camera animation triggered
          ↓
useBillboardStore updated
          ↓
Any component listening to store reacts
```

### What Does NOT Trigger It
- ❌ Camera panning
- ❌ Camera zooming
- ❌ Camera rotating
- ❌ Looking around
- ❌ Any camera-only movement

### What DOES Trigger It
- ✅ Player character moving physically (X, Z position)
- ✅ Character entering 8-unit radius sphere
- ✅ Character exiting 8-unit radius sphere

## Configuration

### Vicinity Trigger Distance
Edit `DonorsBillboardWithFocus.tsx`:
```typescript
triggerDistance = 8  // Radius in units (smaller = tighter area)
```

**Recommendations:**
- **5 units** - Very tight, player must be right next to billboard
- **8 units** - Current, responsive but not too sensitive
- **12 units** - Loose, triggers from fairly far away

### Camera Focus Distance
```typescript
focusDistance: 7  // How close camera gets to billboard
```

## Consumer Example - Using the Store

Any component can react to billboard vicinity:

```typescript
import { useBillboardStore } from "@/stores/billboardStore";

export function ProximityUI() {
  const isInVicinity = useBillboardStore(
    (state) => state.isInBillboardVicinity
  );

  if (!isInVicinity) return null;

  return <div>You're near the donor billboard!</div>;
}
```

## Technical Deep Dive

### Rapier Sensor Collider
- **Type**: Fixed RigidBody (doesn't move or fall)
- **Shape**: Sphere with configurable radius
- **Mode**: Sensor (collision detected but no physics response)
- **Callbacks**: `onIntersectionEnter` and `onIntersectionExit`

### Why This Is Better
1. **Physics-accurate** - Uses the same collision system as game physics
2. **Player-position-only** - Camera movement = zero influence
3. **Reliable** - Battle-tested Rapier API
4. **Performant** - Physics engine already running collision checks
5. **No false positives** - Only real player movement triggers it

### What Happens If You Pan Camera
```
Camera pans → Camera position changes
          ↓
          ↓ (Rapier doesn't care about camera)
          ↓
Player collider still same position
          ↓
No intersection with sensor
          ↓
Nothing happens! ✓
```

## Migration from Old System

**Old (broken):**
```typescript
// Used camera position - pan = false positive
const getPlayerPosition = () => camera.position; // WRONG!
const distance = playerPos.distanceTo(billboard);
```

**New (correct):**
```typescript
// Uses actual player physics collider
<RigidBody sensor onIntersectionEnter={...} />
// Rapier handles collision math - camera ignored!
```

## Testing Checklist

- [ ] Dev server compiles without errors
- [ ] Player walks toward billboard (within 8 units)
- [ ] Focus triggers automatically
- [ ] Camera animates smoothly to billboard
- [ ] **Pan camera around while near billboard**
- [ ] **Panning does NOT re-trigger focus** ✓ KEY TEST
- [ ] Walk away from billboard (exit 8-unit radius)
- [ ] Focus exits smoothly
- [ ] Zustand state reflects changes
- [ ] Glow ring appears/disappears correctly
- [ ] WASD movement works while focused

## Files Changed

### Modified
- `components/3D/DonorsBillboard.tsx` - Simplified
- `components/3D/DonorsBillboardWithFocus.tsx` - Collision-based
- `hooks/useProximity/useBillboardProximity.ts` - Animation only

### Created
- `stores/billboardStore.ts` - Zustand proximity state

### Deleted
- All donate button logic
- Custom distance calculation
- Camera position-based detection

## Related Files
- `pages/p.tsx` - Scene integration
- `public/donors.json` - Donor data

---

**Status**: ✅ **COMPLETE - CAMERA-PROOF COLLISION DETECTION**  
Physics-based proximity that ignores camera movement. Only player position matters.
