# Billboard Focus Feature

## Overview

The billboard now has **smart auto-focus functionality**. When the player gets close to the donors billboard, the camera automatically focuses on it for easy reading. This solves the problem of needing higher DPR while keeping performance optimal at DPR 1.4.

## How It Works

### 1. Proximity Detection
- Continuously monitors distance between player and billboard
- When player enters **15 units** of the billboard, focus mode activates
- When player leaves, focus mode deactivates

### 2. Camera Animation
- Smooth 1-second animation moves camera to face the billboard
- Camera positions at a good viewing distance (12 units)
- Billboard text becomes clearly readable
- Camera is no longer controlled by Ecctrl during focus

### 3. Player Movement
- **WASD movement still works** - you can move around while focused
- Walking away from the billboard automatically exits focus mode
- Returns camera to Ecctrl control seamlessly

### 4. Visual Feedback
- Subtle golden glow ring appears on the billboard when in proximity
- Indicates the focus trigger area

## Technical Details

### Files Added/Modified

```
hooks/useProximity/
├── useBillboardProximity.ts    # NEW: Proximity detection hook
└── index.ts                    # NEW: Export file

components/3D/
├── DonorsBillboardWithFocus.tsx # NEW: Billboard wrapper with focus
└── DonorsBillboard.tsx          # Unchanged: Canvas texture billboard

pages/
└── p.tsx                        # MODIFIED: Uses focus component, manages state
```

### Hook: `useBillboardProximity`

```typescript
const { isInProximity, isFocused } = useBillboardProximity({
  billboardPosition: [0, 5, -40],
  triggerDistance: 15,           // How close to trigger focus
  focusDistance: 12,             // How far from billboard camera sits
  animationDuration: 1000,       // 1 second smooth animation
  onEnterProximity: () => { },   // Callback when entering
  onExitProximity: () => { },    // Callback when leaving
});
```

### Component: `DonorsBillboardWithFocus`

```tsx
<DonorsBillboardWithFocus
  position={[0, 5, -40]}
  triggerDistance={15}
  onFocusChange={(isFocused) => {
    // Update parent state to disable Ecctrl
    setIsBillboardFocused(isFocused);
  }}
/>
```

## UX Flow

```
Player Walking
     ↓
Enters 15-unit radius
     ↓
Camera smoothly animates (1 second)
     ↓
Camera faces billboard at 12 units
Camera is locked (no mouse pan control)
     ↓
Player can still move with WASD
     ↓
Player walks away beyond 15 units
     ↓
Camera smoothly animates back
Ecctrl control restored
     ↓
Back to normal gameplay
```

## Configuration Options

All of these can be adjusted by modifying the `DonorsBillboardWithFocus` props:

| Option | Default | Meaning |
|--------|---------|---------|
| `position` | `[0, 5, -40]` | 3D position of billboard |
| `triggerDistance` | `15` | How close (units) before auto-focus triggers |
| `onFocusChange` | callback | Called when focus state changes |

To adjust, modify in `pages/p.tsx`:

```tsx
<DonorsBillboardWithFocus
  position={[0, 5, -40]}
  triggerDistance={20}  // Change to trigger at 20 units away
  onFocusChange={setIsBillboardFocused}
/>
```

## Ecctrl Integration

The focus state disables Ecctrl's camera control:

```tsx
<Ecctrl
  ...
  disableControl={!!openZoneId || isBillboardFocused}
/>
```

When `isBillboardFocused` is `true`:
- ✅ Mouse drag (camera pan) is disabled
- ✅ Ecctrl camera following is disabled  
- ✅ Character rotation with mouse is disabled
- ✅ WASD character movement **still works**

## Performance Impact

This feature has **minimal performance cost**:

1. **Proximity check** - Runs every 100ms, simple distance calculation
2. **Camera animation** - Uses `requestAnimationFrame`, smooth 60fps
3. **No new meshes** - Only a subtle glow ring (optional, lightweight)

**Result:** Can keep DPR at 1.4 (good compromise between quality and performance) while having excellent billboard readability through focus mode.

## Future Enhancements

Ideas for extending this pattern:

1. **Multiple billboards** - Each billboard can use the same hook
2. **Interaction prompts** - Show "Press SPACE to read" UI when nearby
3. **Timed exit** - Auto-exit after reading for 10+ seconds
4. **Sound effects** - Play sound on enter/exit
5. **Billboard-specific UI** - Show additional info when focused
6. **Animation variations** - Different camera paths for different billboards

## Troubleshooting

### Focus doesn't trigger
- Check `triggerDistance` - increase to 20 or 25
- Verify billboard position matches where you're testing
- Check console for errors in `useBillboardProximity`

### Camera doesn't animate smoothly
- Verify `animationDuration` is at least 500ms
- Check that Ecctrl has `disableControl={isBillboardFocused}` set

### Camera returns too quickly
- Increase `triggerDistance` so exit zone is farther away
- Example: `triggerDistance={20}` for 20-unit exit zone

### Still can't read text
- The canvas texture quality is already optimized at 3072×1536
- Focus camera gets you close enough to read at DPR 1.4
- If still blurry, temporarily test with DPR 2 in Canvas props

## Code References

1. **Proximity Detection Logic** - `useBillboardProximity.ts` lines 158-191
2. **Camera Animation** - `useBillboardProximity.ts` lines 80-110  
3. **Focus Component** - `DonorsBillboardWithFocus.tsx` lines 1-55
4. **Scene Integration** - `pages/p.tsx` lines 54, 175, 309-313

---

**Summary:** The billboard focus feature provides a polished UX where players automatically get a perfect view of the billboard when nearby, without sacrificing performance or requiring global DPR changes. It's a reusable pattern that can be applied to other billboards in the game!
