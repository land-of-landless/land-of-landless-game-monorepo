import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Physics, RigidBody } from "@react-three/rapier";
import {
  Box,
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from "@react-three/drei";
import { round } from "lodash";
import { useState } from "react";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export default function Play() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas dpr={dpr}>
      <PerformanceMonitor
        onIncline={() => {
          console.log("Things are smooth, let's crank it up!");
          setDpr(2); // Increase DPR
        }}
        onDecline={() => {
          console.log("FPS is dropping, reducing quality...");
          setDpr(1); // Reduce DPR
        }}
        // Custom bounds: trigger incline/decline if FPS falls outside 45-60
        bounds={(refreshRate) => [45, 60]}
        flipflops={3} // If it flips between states 3 times, it's unstable
        onFallback={() => {
          // If performance is unstable, set a safe baseline
          console.warn("Performance unstable. Locking to low quality.");
          setDpr(1);
        }}
      >
        <AdaptiveDpr />
        <AdaptiveEvents />
        {/* The rest of your game scene */}
        <camera position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 10, 10]} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <Physics timeStep="vary" debug={true} gravity={[0, 0, 0]}>
          <RigidBody position={[0, 0, 0]}>
            <Box
              args={[1, 1, 1]}
              position={[0, 1, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </RigidBody>
        </Physics>
      </PerformanceMonitor>
      <Preload all />
    </Canvas>
  );
}
