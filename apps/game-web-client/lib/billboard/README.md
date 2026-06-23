# Html Billboard System

A reusable system for rendering sharp, crisp HTML content as 3D billboards in your Three.js/React Three Fiber scene.

## Overview

The `HtmlBillboard` component wraps `@react-three/drei`'s `Html` component and provides:

- ✅ **Sharp, crisp rendering** - Uses drei's optimized HTML-to-canvas rendering
- ✅ **Proper pointer event handling** - Doesn't interfere with Ecctrl camera controls or other canvas interactions
- ✅ **Reusable component** - Use the same component everywhere in your scene
- ✅ **Billboard pool/registry** - Track and manage multiple billboards via Context
- ✅ **Full TypeScript support** - Properly typed interfaces and props

## Why Not Canvas Texture?

You might wonder why we use HTML rendering instead of pure canvas textures. Here's why:

| Aspect | HTML Billboard | Canvas Texture |
|--------|---|---|
| **Text Quality** | Sharp, native font rendering | Can be blurry/pixelated |
| **Styling** | Full CSS support (gradients, shadows, etc) | Manual canvas drawing |
| **Layout** | Flexbox, grid, responsive | Manual positioning |
| **Development Speed** | Fast (use React/HTML) | Slower (canvas API) |
| **Interactivity** | Potential for hover/click | Not interactive |
| **Performance** | Renders to internal canvas (optimized) | Manual texture management |

The `Html` component from drei is purpose-built for this and renders to its own optimized canvas internally, so you get the best of both worlds.

## Basic Usage

### Simple Billboard

```tsx
import { HtmlBillboard } from "@/lib/billboard";

export function MyBillboard() {
  return (
    <group position={[0, 5, -30]}>
      {/* 3D geometry */}
      <mesh>
        <boxGeometry args={[8, 1, 0.5]} />
        <meshStandardMaterial color="#1a1a24" />
      </mesh>

      {/* HTML Content */}
      <HtmlBillboard position={[0, 0, 0.2]} scale={0.008}>
        <div className="w-[1000px] bg-white p-8 rounded-lg shadow-lg">
          <h2>Welcome to My Billboard!</h2>
          <p>This renders sharp HTML content in 3D space.</p>
        </div>
      </HtmlBillboard>
    </group>
  );
}
```

### With Custom Styling

```tsx
<HtmlBillboard 
  position={[5, 3, -10]} 
  scale={0.01}
  className="custom-billboard"
  style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))" }}
>
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white rounded-xl">
    Styled with Tailwind & inline styles
  </div>
</HtmlBillboard>
```

## Props

```typescript
interface HtmlBillboardProps {
  position?: [number, number, number];      // 3D position in scene
  scale?: number;                            // Scale factor (default: 1)
  occlude?: boolean | "raycast" | "blending"; // Occlusion mode
  children: ReactNode;                       // HTML content
  className?: string;                        // CSS class for wrapper
  style?: React.CSSProperties;               // Inline styles for wrapper
}
```

### Key Props Explained

- **`position`** - Where the billboard appears in 3D space. Typically `[x, y, z]`
- **`scale`** - How large the HTML renders. Smaller values = smaller text (like 0.008 for distant billboards)
- **`occlude`** - Whether the billboard should be hidden behind other objects:
  - `"blending"` - Semi-occlude with transparency
  - `"raycast"` - Full occlusion
  - `false` - Always visible (default in HtmlBillboard)

## Advanced Usage: Billboard Registry/Pool

### Setup in Your Scene

Wrap your scene with the provider:

```tsx
import { Canvas } from "@react-three/fiber";
import { BillboardProvider } from "@/lib/billboard";

export function GameScene() {
  return (
    <Canvas>
      <BillboardProvider>
        <Scene />
      </BillboardProvider>
    </Canvas>
  );
}
```

### Use the Hook to Register Billboards

```tsx
import { useBillboard } from "@/lib/billboard";

export function MarkerBillboard() {
  useBillboard("marker-1", {
    position: [10, 5, -20],
    scale: 0.01,
  });

  return (
    <HtmlBillboard position={[10, 5, -20]} scale={0.01}>
      <div className="bg-yellow-500 p-4 rounded">Marker 1</div>
    </HtmlBillboard>
  );
}
```

### Track All Billboards Globally

```tsx
import { useContext } from "react";
import { BillboardContext } from "@/lib/billboard";

export function BillboardStats() {
  const context = useContext(BillboardContext);
  const count = context?.billboards.size ?? 0;

  return <div>Active Billboards: {count}</div>;
}
```

## Real-World Example: Donors Billboard

See `components/3D/DonorsBillboard.tsx` for a complete example showing:

- ✅ Using `HtmlBillboard` with complex React content
- ✅ Rendering 4-column layout with data
- ✅ Styling with Tailwind and custom CSS
- ✅ Proper event handling and no pointer capture

## Performance Considerations

1. **One HTML canvas per billboard** - The `Html` component from drei creates one canvas for each billboard, which is efficient
2. **Avoid excessive re-renders** - Memoize content with `useMemo` if data changes frequently
3. **Keep HTML simple** - Complex nested DOM = slower rendering
4. **Use `occlude="blending"`** - Helps with performance for billboards not always visible

## Pointer Events

The `HtmlBillboard` is configured with `pointerEvents="none"` to ensure:

- ✅ Mouse drag (camera panning) works
- ✅ Ecctrl character controller works
- ✅ Click events on canvas elements work
- ✅ No interference with game controls

If you need interactive billboards, you can override this:

```tsx
<HtmlBillboard position={[0, 0, 0]}>
  <div 
    className="pointer-events-auto cursor-pointer"
    onClick={() => console.log("Clicked!")}
  >
    Click me!
  </div>
</HtmlBillboard>
```

## Troubleshooting

### Billboard appears blurry

- Make sure you're using `HtmlBillboard` (not the canvas texture approach)
- The `Html` component handles rendering optimization internally

### Camera controls stop working

- Check that `pointerEvents="none"` is set on the Html component
- Ensure `pointer-events-none` class is on wrapper divs
- If your content needs to be interactive, only set `pointer-events-auto` on specific interactive elements

### Billboard position is wrong

- Remember `scale` affects how the position is interpreted
- Test with `position={[0, 0, -10]}` first to verify placement

## Files

- `HtmlBillboard.tsx` - Main component and Context definitions
- `index.ts` - Exports
- `README.md` - This documentation

## Next Steps

Once you have this system working, you can:

- ✅ Create location/info billboards throughout your game world
- ✅ Build leaderboards, scoreboards, or announcement boards
- ✅ Display quest markers or NPC names
- ✅ Create interactive shop/menu boards
- ✅ Build a notification/message board system

All using the same reusable `HtmlBillboard` component!
