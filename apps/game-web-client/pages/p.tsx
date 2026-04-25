import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <Canvas>
      <camera position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 10, 10]} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </Canvas>
  );
}
