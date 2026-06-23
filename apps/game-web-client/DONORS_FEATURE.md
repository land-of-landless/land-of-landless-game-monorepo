# 🎯 Donors Banner Feature

## Overview

The Donors Banner is an eye-catching UI component that displays supporters of the game development project. It's designed to encourage donations while maintaining an exciting, visually appealing presentation.

## 📁 File Structure

```
game-web-client/
├── data/
│   └── donors.json                 # Fake donor data (JSON)
├── hooks/
│   └── useDonors.ts               # Hook to fetch donor data
├── components/UI/
│   └── DonorsBanner.tsx           # Main banner component
└── pages/
    ├── p.tsx                      # Original page (updated with banner)
    └── p-refactored.tsx           # Refactored page (updated with banner)
```

## 🎨 Component Features

### DonorsBanner.tsx

The main banner component with:

- **4 Category Tabs**: Recent, Weekly, Monthly, All-Time donors
- **Dynamic Colors**: Each category has a unique color gradient:
  - Recent: 🔥 Orange to Red
  - Weekly: 📈 Blue to Cyan
  - Monthly: ⭐ Purple to Pink
  - All-Time: 👑 Yellow to Amber

- **Visual Elements**:
  - Animated background glow
  - Gradient accents and borders
  - Backdrop blur for modern look
  - Hover effects on donor items
  - Glowing "Become a Supporter" button

- **Information Displayed**:
  - Donor rank (numbered badges)
  - Donor name (truncated if too long)
  - Amount donated in USD
  - Total raised per category

- **Size**: Fixed to `max-w-sm` (384px) - noticeable but not overwhelming
- **Position**: Bottom-left corner (fixed)
- **Scrollable**: Max height of 192px with custom styled scrollbar

## 🔌 Hook: useDonors.ts

Handles data fetching and state management:

```typescript
const { donors, isLoading, error } = useDonors();
```

**Current Behavior**: Fetches from `/data/donors.json` (local mock)

**To Use Real API**:
1. Update the fetch URL in `useDonors.ts`
2. Ensure API returns the same structure:
   ```typescript
   {
     "recent": Donor[],
     "weekly": Donor[],
     "monthly": Donor[],
     "allTime": Donor[]
   }
   ```

## 📊 Data Format

Each donor object:
```typescript
interface Donor {
  name: string;        // Donor's display name
  amount: number;      // Amount donated in USD
}
```

Full donor data structure:
```typescript
interface DonorsData {
  recent: Donor[];     // Recent donations
  weekly: Donor[];     // This week's donations
  monthly: Donor[];    // This month's donations
  allTime: Donor[];    // All time top donors
}
```

## 🚀 Current Mock Data

Located in `data/donors.json`:
- Recent: 4 donors (total: $975)
- Weekly: 4 donors (total: $650)
- Monthly: 4 donors (total: $2,900)
- All-Time: 5 donors (total: $16,000)

## 🔄 Integration Steps

### Already Completed ✅
1. ✅ Created DonorsBanner component
2. ✅ Created useDonors hook
3. ✅ Added DonorsBanner to `p.tsx`
4. ✅ Added DonorsBanner to `p-refactored.tsx`
5. ✅ Created mock donor data

### Next Steps (When Ready)

1. **Replace Mock API**:
   - Update `hooks/useDonors.ts` line 29:
   ```typescript
   const response = await fetch("YOUR_API_ENDPOINT");
   ```

2. **Add Authentication** (if needed):
   - Add auth headers to fetch request

3. **Error Handling**:
   - Component gracefully handles empty states
   - Falls back to empty array if API fails

4. **Real-time Updates** (Optional):
   - Add polling: `setInterval(() => fetchDonors(), 30000)` (30 seconds)
   - Or use WebSocket for live updates

## 🎯 Design Philosophy

- **Eye-catching**: Animated glow, gradient colors, positioned bottom-left
- **Non-intrusive**: Fixed size, doesn't block gameplay
- **Interactive**: Category tabs, hover effects, scroll for more
- **Motivating**: Large donation amounts displayed, "Become a Supporter" CTA
- **Responsive**: Uses Tailwind for responsive design
- **Performance**: Lazy loads, doesn't impact game performance

## 🛠️ Customization

### Change Position
Edit `DonorsBanner.tsx` line 48:
```jsx
<div className="fixed bottom-4 left-4 ..."> // Change to top-right, etc.
```

### Change Colors
Edit the `categoryData` object in `DonorsBanner.tsx` (lines 14-37)

### Change Size
Modify `max-w-sm` class to different Tailwind width (e.g., `max-w-md`, `max-w-xs`)

### Add More Categories
1. Add to `DonorsData` interface in `useDonors.ts`
2. Add mock data to `donors.json`
3. Add tab configuration to `categoryData` in `DonorsBanner.tsx`

## 💡 Ideas for Enhancement

1. **Tier System**: Different badges for VIP/premium donors
2. **Animations**: Sliding in new donors in real-time
3. **Achievements**: Special badges for milestone donors
4. **Leaderboard**: Click to expand full leaderboard
5. **Sound Effect**: Ding sound when new donor added
6. **Currency Support**: Show donations in different currencies
7. **Social Integration**: Link to donor's Twitter/GitHub
8. **Persistence**: Save donor list to localStorage with timestamp

## 🧪 Testing

1. Ensure banner appears on game load
2. Test category tab switching
3. Verify totals calculation
4. Check scrollbar appears when many donors
5. Test on different screen sizes
6. Verify API error handling

## 📝 Notes

- Component uses `useDonors` hook for data - keeps UI logic separate
- Responsive scrollbar styled with custom CSS
- All gradients use Tailwind gradient utilities
- Backdrop blur requires Tailwind v3+
- Position is fixed to viewport, not relative to game canvas
