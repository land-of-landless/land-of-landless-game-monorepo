import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useDetectGPU } from "@react-three/drei";
import SmallScreenDescription from "@/components/MobileView/SmallScreenDescription";

// Set to true to force small screen mode for testing
const FORCE_SMALL_SCREEN = false;

export async function getStaticProps() {
  return { props: {} };
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(true);
  const GPUTier = useDetectGPU();

  const deviceTier = useMemo(() => {
    // Tier 3: high-end, 2: mid, 1: low, 0: fallback
    return GPUTier.tier || 1;
  }, [GPUTier]);

  useEffect(() => {
    // Check screen size
    const checkScreenSize = () => {
      const isSmall = FORCE_SMALL_SCREEN || window.innerWidth < 960;
      setIsSmallScreen(isSmall);
      setIsLoading(false);

      // Redirect to /p if not small screen
      if (!isSmallScreen) {
        router.push("/p");
      }
    };

    // Initial check
    checkScreenSize();
    // useDeviceTier();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isSmallScreen, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4 bg-black text-white">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p>Checking your device...</p>
      </div>
    );
  }

  // Show small screen message if screen is too small
  if (isSmallScreen) {
    return <SmallScreenDescription />;
  }

  // This will be shown very briefly before the redirect happens
  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <p>Checking if your device is compatible...</p>
    </div>
  );
}
