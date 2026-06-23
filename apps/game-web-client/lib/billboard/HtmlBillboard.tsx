import React, { ReactNode } from "react";
import { Html } from "@react-three/drei";

export interface HtmlBillboardProps {
  position?: [number, number, number];
  scale?: number;
  occlude?: boolean | "raycast" | "blending";
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Html Billboard component with proper pointer event handling.
 *
 * This component wraps @react-three/drei's Html component and configures it
 * to render sharp, crisp HTML content in 3D space without interfering with
 * canvas pointer events (camera controls, etc).
 *
 * The Html component internally renders to a canvas, so it's optimized for
 * rendering HTML in 3D. This wrapper ensures proper event handling.
 *
 * Usage:
 * ```tsx
 * <HtmlBillboard position={[0, 5, -30]} scale={0.008}>
 *   <div className="bg-white p-4 rounded">Your HTML content here</div>
 * </HtmlBillboard>
 * ```
 */
export const HtmlBillboard: React.FC<HtmlBillboardProps> = ({
  position = [0, 0, 0],
  scale = 1,
  occlude = "blending",
  children,
  className = "",
  style = {},
}) => {
  return (
    <Html
      transform
      position={position}
      scale={scale}
      occlude={occlude}
      // Critical: Use inline style to prevent pointer event capture
      // This ensures mouse events pass through to the canvas underneath
      style={{
        pointerEvents: "none",
        ...style,
      }}
      // Tell drei we don't want it to manage pointer events
      distanceFactor={1}
    >
      {/* Wrapper div with pointer-events-none ensures children don't capture events */}
      <div
        className={`pointer-events-none ${className}`}
        style={{
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </Html>
  );
};

/**
 * Context for managing a pool/instance of billboards across the game.
 * This allows you to:
 * - Use multiple Html billboards without performance issues
 * - Share pointer event configuration
 * - Manage billboards globally if needed
 */
export const BillboardContext = React.createContext<{
  billboards: Map<string, HtmlBillboardProps>;
  registerBillboard: (id: string, config: HtmlBillboardProps) => void;
  unregisterBillboard: (id: string) => void;
} | null>(null);

/**
 * Provider component for managing billboard instances.
 * Wrap this around your scene to enable the billboard pool system.
 */
export const BillboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [billboards, setBillboards] = React.useState(
    new Map<string, HtmlBillboardProps>(),
  );

  const registerBillboard = React.useCallback(
    (id: string, config: HtmlBillboardProps) => {
      setBillboards((prev) => new Map(prev).set(id, config));
    },
    [],
  );

  const unregisterBillboard = React.useCallback((id: string) => {
    setBillboards((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <BillboardContext.Provider
      value={{ billboards, registerBillboard, unregisterBillboard }}
    >
      {children}
    </BillboardContext.Provider>
  );
};

/**
 * Hook to register and manage a billboard in the pool.
 *
 * Usage:
 * ```tsx
 * useBillboard("donor-billboard", { position: [0, 5, -30], scale: 0.008 });
 * ```
 */
export const useBillboard = (id: string, config: HtmlBillboardProps) => {
  const context = React.useContext(BillboardContext);

  React.useEffect(() => {
    if (context) {
      context.registerBillboard(id, config);
      return () => context.unregisterBillboard(id);
    }
  }, [id, config, context]);

  return context;
};
