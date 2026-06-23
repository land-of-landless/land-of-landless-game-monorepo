import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useDonors, Donor } from "@/hooks/useDonors";

/**
 * Creates a high-quality canvas texture with donor information.
 * Uses canvas rendering to avoid pointer event capture issues.
 * Text is rendered with system fonts which are naturally sharp.
 */
function DonorsCanvasTexture({ donors }: { donors: any }) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    // Ultra-high resolution for maximum text clarity
    c.width = 3072;
    c.height = 1536;
    const ctx = c.getContext("2d", { alpha: true })!;

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, c.width, c.height);

    // Border
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, c.width - 30, c.height - 30);

    // Title - using system font for sharpness (LARGER & BOLDER)
    ctx.fillStyle = "#facc15";
    ctx.font =
      "900 128px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("💎 Supporting Heroes 💎", c.width / 2, 50);

    // Subtitle (LARGER & BOLDER)
    ctx.fillStyle = "#a1a1aa";
    ctx.font =
      "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Top Contributors to Development", c.width / 2, 190);

    // Column headers and data
    const columnWidth = (c.width - 60) / 4;
    const columnX = [
      45,
      45 + columnWidth,
      45 + columnWidth * 2,
      45 + columnWidth * 3,
    ];
    const columns = [
      {
        title: "🔥 Recent",
        donors: donors.recent,
        color: "#ea580c",
        sort: false,
      },
      {
        title: "📈 Weekly",
        donors: donors.weekly,
        color: "#22c55e",
        sort: true,
      },
      {
        title: "⭐ Monthly",
        donors: donors.monthly,
        color: "#ec4899",
        sort: true,
      },
      {
        title: "👑 All-Time",
        donors: donors.allTime,
        color: "#facc15",
        sort: true,
      },
    ];

    columns.forEach((col, idx) => {
      const x = columnX[idx];
      const colWidth = columnWidth - 20;

      // Column title (LARGER & BOLDER)
      ctx.fillStyle = "white";
      ctx.font =
        "900 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(col.title, x, 290);

      // Column border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 15, 360, colWidth + 30, c.height - 480);

      // Sort donors if needed
      let sortedDonors = col.donors;
      if (col.sort) {
        sortedDonors = [...col.donors].sort((a, b) => b.amount - a.amount);
      }

      // Donor list (LARGER & BOLDER)
      ctx.font =
        "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      let yOffset = 390;
      const maxDonors = 5;

      sortedDonors.slice(0, maxDonors).forEach((donor: Donor) => {
        const name = donor.name.substring(0, 15);
        const amount = `$${donor.amount}`;

        ctx.textAlign = "left";
        ctx.fillText(name, x, yOffset);
        ctx.fillStyle = col.color;
        ctx.textAlign = "right";
        ctx.fillText(amount, x + colWidth - 15, yOffset);
        ctx.textAlign = "left";
        ctx.fillStyle = "#cbd5e1";

        yOffset += 54;
      });

      // Totals removed per user request
    });

    return c;
  }, [donors]);

  return canvas;
}

function BillboardMesh({
  position,
  donors,
}: {
  position: [number, number, number];
  donors: any;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const canvas = DonorsCanvasTexture({ donors });

  useEffect(() => {
    if (!meshRef.current || !canvas) return;

    const texture = new THREE.CanvasTexture(canvas);

    // Use LinearFilter for the high-resolution canvas
    // This provides a good balance between sharpness and smoothness
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter; // Better for distant viewing
    texture.generateMipmaps = true;

    // Ensure texture is properly configured for color accuracy
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
      dithering: true, // Reduces banding artifacts
    });

    if (meshRef.current.material instanceof THREE.Material) {
      (meshRef.current.material as THREE.Material).dispose();
    }
    meshRef.current.material = material;
  }, [canvas]);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[8, 5]} />
      <meshBasicMaterial color="#1a1a2e" />
    </mesh>
  );
}

export const DonorsBillboard = ({
  position = [0, 5, -30] as [number, number, number],
}: {
  position?: [number, number, number];
}) => {
  const { donors, isLoading } = useDonors();

  if (isLoading || !donors) {
    return null;
  }

  return (
    <group position={position}>
      {/* Billboard Stand/Base */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[8, 1, 0.5]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Billboard Back Panel */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[8.2, 5.2, 0.3]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Support Poles */}
      <mesh position={[-3.8, 0, 0]}>
        <boxGeometry args={[0.3, 5, 0.3]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[3.8, 0, 0]}>
        <boxGeometry args={[0.3, 5, 0.3]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Billboard Content - Canvas Texture */}
      <BillboardMesh position={[0, 0, 0.2]} donors={donors} />

      {/* Glow Effect */}
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[9, 5.8, 0.2]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};
