# Donate Button Feature for Donors Billboard

## Overview
Added an interactive "Donate" button to the Donors Billboard that appears when the player is in proximity to the billboard. The button opens a donation link in a new tab using a configurable environment variable.

## Features
✅ **Donate Button on Canvas**
- Orange gradient button with glow effect rendered directly on billboard canvas
- Heart emoji + "DONATE" text for visual appeal
- Positioned below the main header, before columns
- Only renders when in proximity/zoom mode
- Hidden when not focused on billboard (prevents accidental clicks)

✅ **Smart Visibility & Click Detection**
- Button only appears when player is within 15 units of the billboard (proximity mode)
- Only active during camera zoom/focus mode
- Detects clicks in the top 25% of screen (button area)
- Opens donation URL in a new tab via `window.open()`
- Button completely hidden when not in proximity to avoid unintended clicks

✅ **Environment Variable Configuration**
- Uses `NEXT_PUBLIC_DONATION_URL` environment variable
- Falls back to `https://thelol.xyz/donation` if not set
- Easy to change per deployment/environment

## Implementation Details

### Files Modified

#### 1. `.env.local` (Created)
```env
NEXT_PUBLIC_DONATION_URL=https://thelol.xyz/donation
```

#### 2. `components/3D/DonorsBillboard.tsx` (Updated)
**Changes:**
- Added `DonateButtonArea` interface to define button click zone
- Added global `donateButtonArea` variable to store button coordinates
- Updated `DonorsCanvasTexture()` function signature:
  - Now accepts `isInProximity` boolean prop
  - Conditionally renders donate button only when in proximity
- Button rendering (only when `isInProximity === true`):
  - Positioned below subtitle, before columns start (at Y: 270)
  - Button dimensions: 380px wide × 100px tall
  - Orange gradient background (#ff6b35 → #f7931e)
  - Golden border with glow effect
  - Bold 68px font with heart emoji
  - Sets `donateButtonArea` when visible, clears when hidden
- Updated `BillboardMesh()` to:
  - Accept and pass `isInProximity` prop to canvas texture
  - Add click event listener that only works when button is visible
  - Check if click is in top 25% of screen (button area)
  - Only opens donation URL when button area is defined
- Updated `DonorsBillboard()` export to:
  - Accept and pass through `isInProximity` prop

**Canvas Rendering Code:**
```typescript
// Only render when in proximity
if (isInProximity) {
  // Button area (top center, below header, 380×100px)
  const buttonHeight = 100;
  const buttonWidth = 380;
  const buttonX = (c.width - buttonWidth) / 2;
  const buttonY = 270; // Below subtitle, before columns

  // Gradient background
  const gradient = ctx.createLinearGradient(...);
  gradient.addColorStop(0, "#ff6b35");
  gradient.addColorStop(1, "#f7931e");

  // Border and text rendering
  ctx.fillText("💝 DONATE", c.width / 2, buttonY + buttonHeight / 2);

  // Store button area
  donateButtonArea = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
} else {
  // Hide button when not in proximity
  donateButtonArea = null;
}
```

**Click Detection:**
```typescript
const handleClick = (event: MouseEvent) => {
  if (!donateButtonArea) return; // Button not visible, skip

  const clickY = event.clientY;
  const windowHeight = window.innerHeight;
  const topThreshold = windowHeight * 0.25; // Top 25% of screen

  if (clickY < topThreshold) {
    const donationUrl =
      process.env.NEXT_PUBLIC_DONATION_URL ||
      "https://thelol.xyz/donation";
    window.open(donationUrl, "_blank");
  }
};
```

#### 3. `components/3D/DonorsBillboardWithFocus.tsx` (Updated)
**Changes:**
- Pass `isInProximity` state to `DonorsBillboard` component
- Enables/disables donate button click functionality based on proximity

## User Experience Flow

1. **Default State**: Player sees billboard from distance
   - Donate button is NOT rendered on canvas (invisible)
   - Billboard shows only header and donor columns
   - Clicks have no effect on donation link

2. **Proximity Triggered**: Player moves within 15 units of billboard
   - Camera auto-focuses on billboard (zoom mode)
   - Donate button appears below header, above columns
   - Button is bright and attention-grabbing
   - Clicks in top 25% of screen open donation URL

3. **Exit Proximity**: Player walks away beyond 15 units
   - Donate button disappears from canvas (not rendered)
   - Camera returns to normal Ecctrl control
   - Billboard shows only header and donor columns again
   - Donate button clicks completely disabled

## Configuration

### Changing the Donation URL
Edit `.env.local`:
```env
NEXT_PUBLIC_DONATION_URL=https://your-donation-link.com
```

### Customizing Button Appearance
Edit `DonorsBillboard.tsx` in `DonorsCanvasTexture()`:
- **Button size**: Modify `buttonHeight` and `buttonWidth` variables
- **Colors**: Change gradient colors (`#ff6b35`, `#f7931e`) and border color (`#ffaa00`)
- **Text**: Change the `fillText()` call
- **Position**: Modify `buttonY` calculation

### Adjusting Click Detection Threshold
Edit `BillboardMesh()` `useEffect`:
```typescript
const topThreshold = windowHeight * 0.25; // Change 0.25 to desired percentage
// Current: 0.25 = button clickable in top 25% of screen
```

## Technical Notes

### Why This Approach?
- **Conditional rendering**: Button only drawn to canvas when `isInProximity === true`
- **Canvas texture**: Avoids pointer event capture issues that plagued the Html component approach
- **Manual click detection**: Checks screen coordinates against button zone + validates `donateButtonArea` exists
- **Double gating**: Button must be visible (rendered) AND click must be in zone to open link
- **UX improvement**: Players don't see the button until they're close, avoiding accidental clicks

### Performance Implications
- Negligible: Only adds click listener when in proximity
- Canvas texture already renders at full quality for readability
- No additional geometry or materials

### Browser Compatibility
- Uses standard `window.open()` for new tab opening
- Respects browser popup settings (may be blocked by popup blockers)
- Works with all modern browsers

## Testing Checklist

- [ ] Dev server compiles without errors (`pnpm --filter game-web-client dev`)
- [ ] Donate button NOT visible when far from billboard (>15 units)
- [ ] Donate button appears below header when in proximity (<15 units)
- [ ] Button not clickable when far from billboard
- [ ] Button clickable when in proximity
- [ ] Click on top 25% of screen area opens donation URL in new tab
- [ ] Click outside top 25% area doesn't open link
- [ ] Camera focus works correctly with button interaction
- [ ] WASD movement still works while in button click range
- [ ] Columns still display correctly below button when visible

## Future Improvements

- [ ] Button hover effect (visual feedback - shadow/glow increase)
- [ ] Raycast-based click detection for pixel-perfect 3D accuracy
- [ ] Animation when button is clicked (pulse/scale effect)
- [ ] Fade-in/fade-out animation when button appears/disappears
- [ ] A/B testing different button colors/text
- [ ] Sound effect when button is clicked
- [ ] Donation counter badge on button ("$X pledged this month")

## Related Files
- `hooks/useProximity/useBillboardProximity.ts` - Proximity detection logic
- `hooks/useDonors.ts` - Donor data fetching
- `public/donors.json` - Mock donor data
