import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import {
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  Sky,
} from "@react-three/drei";
import Ecctrl from "ecctrl";
import { Suspense, useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useGameStore, useGameComputed } from "../stores/gameStore";
import { Perf } from "r3f-perf";
import { useFullscreen, useSpeech } from "rooks";
import {
  Maximize,
  Minimize,
  Volume2,
  StopCircle,
  Sparkles,
  Coins,
  Shield,
  BookOpen,
  FileText,
  Vote,
  HelpCircle,
  Check,
  RotateCcw,
} from "lucide-react";
import { playPageFontClassName } from "@/lib/fonts";
import * as THREE from "three";

// Speak helper using Web Speech API directly to avoid re-render lag or hook sync issues
const speakTextDirect = (text: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a high-quality English voice
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

// ----------------------------------------------------
// 3D Visual & Interactive Components
// ----------------------------------------------------

/**
 * Pulsing neon ring and cylinder beam for interactive zones
 */
const InteractiveZoneVisual = ({ radius, color }: { radius: number; color: string }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Pulse the floor ring
    if (ringRef.current) {
      const scale = 1 + Math.sin(elapsed * 4) * 0.06;
      ringRef.current.scale.set(scale, scale, 1);
      if (ringRef.current.material) {
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.25 + Math.sin(elapsed * 4) * 0.08;
      }
    }

    // Slowly rotate and wobble the wireframe beam
    if (beamRef.current) {
      beamRef.current.rotation.y = elapsed * 0.4;
      if (beamRef.current.material) {
        (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.04 + Math.sin(elapsed * 2) * 0.01;
      }
    }
  });

  return (
    <group>
      {/* Floor glowing ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <ringGeometry args={[radius - 0.15, radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor solid center indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0, radius - 0.15, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Holographic vertical cylinder beam */}
      <mesh ref={beamRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 5, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
    </group>
  );
};

const InstancedBoxCloud = ({
  items,
  baseSize,
  color,
}: {
  items: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }>;
  baseSize: [number, number, number];
  color: string;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    items.forEach((item, index) => {
      tempObject.position.set(...item.position);
      const rotation = item.rotation ?? [0, 0, 0];
      const scale = item.scale ?? [1, 1, 1];
      tempObject.rotation.set(...rotation);
      tempObject.scale.set(...scale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [items, tempObject]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]}>
      <boxGeometry args={baseSize} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </instancedMesh>
  );
};

const InstancedCylinderCloud = ({
  items,
  baseArgs,
  color,
  roughness = 0.2,
  metalness = 0.8,
  emissive,
  emissiveIntensity,
}: {
  items: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }>;
  baseArgs: [number, number, number, number?];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    items.forEach((item, index) => {
      tempObject.position.set(...item.position);
      const rotation = item.rotation ?? [0, 0, 0];
      const scale = item.scale ?? [1, 1, 1];
      tempObject.rotation.set(...rotation);
      tempObject.scale.set(...scale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [items, tempObject]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]}>
      <cylinderGeometry args={baseArgs} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </instancedMesh>
  );
};

interface ZoneInfo {
  id: string;
  title: string;
  description: string;
  actionText: string;
  color: string;
  speechText: string;
}

interface InteractiveZoneProps {
  id: string;
  position: [number, number, number];
  radius?: number;
  color?: string;
  title: string;
  description: string;
  actionText: string;
  speechText: string;
  onEnterZone: (zone: ZoneInfo) => void;
  onExitZone: (id: string) => void;
}

/**
 * Rapier Physics Sensor Zone
 */
const InteractiveZone = ({
  id,
  position,
  radius = 2.5,
  color = "#00f0ff",
  title,
  description,
  actionText,
  speechText,
  onEnterZone,
  onExitZone,
}: InteractiveZoneProps) => {
  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      colliders={false}
      onIntersectionEnter={() => {
        onEnterZone({ id, title, description, actionText, color, speechText });
      }}
      onIntersectionExit={() => {
        onExitZone(id);
      }}
    >
      {/* Rounded sensor collider */}
      <cylinderGeometry args={[radius, radius, 3]} />

      {/* Sleek pulsing visual indicator */}
      <InteractiveZoneVisual radius={radius} color={color} />
    </RigidBody>
  );
};

/**
 * Beautiful rotating glowing crystal Statue Placeholder with Spotlight & Particles
 */
const StatuePlaceholder = ({ position }: { position: [number, number, number] }) => {
  const crystalOuterRef = useRef<THREE.Mesh>(null);
  const crystalInnerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Rotate and hover outer hologram crystal
    if (crystalOuterRef.current) {
      crystalOuterRef.current.rotation.y = elapsed * 0.6;
      crystalOuterRef.current.rotation.x = elapsed * 0.3;
      crystalOuterRef.current.position.y = 2.8 + Math.sin(elapsed * 2) * 0.15;
    }

    // Spin inner hologram counter-clockwise and faster
    if (crystalInnerRef.current) {
      crystalInnerRef.current.rotation.y = -elapsed * 1.2;
      crystalInnerRef.current.rotation.z = elapsed * 0.6;
      crystalInnerRef.current.position.y = 2.8 + Math.sin(elapsed * 2) * 0.15;
    }

    // Orbit particles around the statue
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.4;
      particlesRef.current.children.forEach((child, idx) => {
        const timeOffset = elapsed * 1.5 + idx * 0.8;
        child.position.y = Math.sin(timeOffset) * 0.6;
      });
    }
  });

  return (
    <group position={position}>
      {/* 1. Grand obsidian/marble pedestal base */}
      <RigidBody type="fixed" friction={0.8}>
        {/* Tier 1 - Bottom Steps */}
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[3.2, 3.4, 0.4, 32]} />
          <meshStandardMaterial color="#111115" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Tier 2 - Middle Section */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
          <meshStandardMaterial color="#0b0b0e" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Tier 3 - Top Columns Stand */}
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <cylinderGeometry args={[1.7, 1.8, 0.6, 32]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Golden circular accent trims on the pedestal */}
        <mesh position={[0, 1.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.65, 1.7, 32]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
        </mesh>
      </RigidBody>

      {/* 2. Holographic Spinning Statue Placeholder */}
      {/* Outer crystalline energy cage */}
      <mesh ref={crystalOuterRef} castShadow position={[0, 2.8, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#00f0ff"
          transparent
          opacity={0.35}
          roughness={0}
          metalness={1}
          emissive="#00b0ff"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Inner high-frequency spinning core */}
      <mesh ref={crystalInnerRef} position={[0, 2.8, 0]}>
        <octahedronGeometry args={[0.45]} />
        <meshStandardMaterial
          color="#ff00a0"
          transparent
          opacity={0.7}
          wireframe
          emissive="#ff00a0"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Spotlight beaming down onto the pedestal from the sky */}
      <spotLight
        position={[0, 12, 0]}
        target-position={[0, 1, 0]}
        intensity={8}
        penumbra={0.4}
        color="#00f0ff"
      />

      {/* 3. Orbiting holographic micro-particles */}
      <group ref={particlesRef} position={[0, 2.8, 0]}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 1.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00f0ff" : "#ff00a0"} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/**
 * A glowing physics ball that bounces and rolls with configurable friction
 */
const FrictionBall = ({
  position,
  color = "#ff4488",
  radius = 0.45,
  friction = 0.6,
  restitution = 0.55,
  emissiveIntensity = 0.8,
}: {
  position: [number, number, number];
  color?: string;
  radius?: number;
  friction?: number;
  restitution?: number;
  emissiveIntensity?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle emissive pulse
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emissiveIntensity + Math.sin(clock.getElapsedTime() * 3) * 0.25;
    }
  });

  return (
    <RigidBody
      position={position}
      colliders="ball"
      friction={friction}
      restitution={restitution}
      linearDamping={0.15}
      angularDamping={0.1}
    >
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>
    </RigidBody>
  );
};

/**
 * Renders neoclassical structural layout: grand columns, glass borders, carpets
 */
const CityHallArchitecture = () => {
  return (
    <group>
      {/* 1. Grand Floor (obsidian tiles) */}
      <RigidBody type="fixed" friction={0.9} position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial color="#08090c" roughness={0.7} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Decorative Red Carpet paths leading to Statue Pedestal */}
      <mesh receiveShadow position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 80]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>
      <mesh receiveShadow position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 6]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>
      {/* Carpet center ring around pedestal */}
      <mesh receiveShadow position={[0, -0.485, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 4.5, 32]} />
        <meshStandardMaterial color="#700909" roughness={0.8} />
      </mesh>

      {/* 2. Outer Guard Walls (Glass & Neon Trimmed Steel pillars) */}
      <RigidBody type="fixed" friction={0.6}>
        {/* Back Wall */}
        <mesh castShadow receiveShadow position={[0, 4, -48]}>
          <boxGeometry args={[96, 8, 0.8]} />
          <meshStandardMaterial color="#10131a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Front Wall with archways */}
        <mesh castShadow receiveShadow position={[0, 4, 48]}>
          <boxGeometry args={[96, 8, 0.8]} />
          <meshStandardMaterial color="#10131a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Left Wall */}
        <mesh castShadow receiveShadow position={[-48, 4, 0]}>
          <boxGeometry args={[0.8, 8, 96]} />
          <meshStandardMaterial color="#10131a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Right Wall */}
        <mesh castShadow receiveShadow position={[48, 4, 0]}>
          <boxGeometry args={[0.8, 8, 96]} />
          <meshStandardMaterial color="#10131a" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Interior Dividing Half-Walls to separate rooms */}
        <mesh position={[-25, 4, 0]}>
          <boxGeometry args={[12, 8, 0.5]} />
          <meshStandardMaterial color="#131620" roughness={0.5} />
        </mesh>
        <mesh position={[25, 4, 0]}>
          <boxGeometry args={[12, 8, 0.5]} />
          <meshStandardMaterial color="#131620" roughness={0.5} />
        </mesh>
      </RigidBody>

    </group>
  );
};

/**
 * 3D Assets for Tourist Info Desk
 */
const TouristDeskAssets = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Sleek Curved Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 1, 1.2]} />
          <meshStandardMaterial color="#1c2030" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Glass glowing screen floating above desk */}
        <mesh position={[0, 1.3, 0.2]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.05]} />
          <meshStandardMaterial
            color="#00f0ff"
            transparent
            opacity={0.6}
            emissive="#00f0ff"
            emissiveIntensity={1.5}
          />
        </mesh>
        {/* Plant Pot decoration */}
        <mesh position={[1.5, 0.5, 0]}>
          <cylinderGeometry args={[0.25, 0.15, 0.6, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Minimalist plant leaf */}
        <mesh position={[1.5, 1.0, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#00aa55" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
};

/**
 * 3D Assets for Mayor's Office
 */
const MayorsOfficeAssets = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Huge Mahogany Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[4.5, 1, 2]} />
          <meshStandardMaterial color="#40170b" roughness={0.2} metalness={0.2} />
        </mesh>
        {/* Desk top gold accents */}
        <mesh position={[0, 1.01, 0]}>
          <boxGeometry args={[4.3, 0.02, 1.8]} />
          <meshStandardMaterial color="#ffd700" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* High-back executive chair */}
        <mesh castShadow position={[0, 0.9, -1.5]}>
          <boxGeometry args={[1.2, 1.8, 0.3]} />
          <meshStandardMaterial color="#701515" roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 0.5, -1.2]}>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>

        {/* Diplomatic Office Flag Pole */}
        <mesh castShadow position={[-2, 2.5, -1.5]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} />
        </mesh>
        {/* Hanging City Crest banner */}
        <mesh position={[-2, 3.8, -1.0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 1.8, 0.02]} />
          <meshStandardMaterial color="#1a3b70" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
};

/**
 * 3D Assets for Treasury Vault
 */
const TreasuryVaultAssets = ({ position }: { position: [number, number, number] }) => {
  const coinStacks = useMemo(
    () =>
      [...Array(12)].map((_, i) => {
        const stackHeight = 1 + (i % 3) * 0.45;
        const xOffset = -2.5 + Math.floor(i / 3) * 1.5 + Math.sin(i) * 0.2;
        const zOffset = -4 - (i % 2) * 1.5;
        return {
          position: [xOffset, stackHeight / 2, zOffset] as [number, number, number],
          scale: [1, stackHeight, 1] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Thick steel bank walls around room */}
        <mesh castShadow position={[-4, 4, -4]}>
          <boxGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#2d323f" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 4, -8]}>
          <boxGeometry args={[8, 8, 0.8]} />
          <meshStandardMaterial color="#2d323f" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Circular vault door lock mechanism */}
        <mesh castShadow position={[0, 3.5, -3.8]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.25, 16, 48]} />
          <meshStandardMaterial color="#8a95a5" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Center rotating gear */}
        <mesh castShadow position={[0, 3.5, -3.7]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
          <meshStandardMaterial color="#ffbc00" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Treasury gold deposit terminal stand */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 1.2, 16]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
        {/* Neon gold pulsing chest model above stand */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial
            color="#ffcc00"
            roughness={0}
            metalness={1}
            emissive="#ff9900"
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* Instanced coin stacks to reduce draw calls */}
        <InstancedCylinderCloud
          items={coinStacks}
          baseArgs={[0.35, 0.35, 1, 12]}
          color="#ffd700"
          roughness={0.1}
          metalness={0.95}
          emissive="#aa7700"
          emissiveIntensity={0.2}
        />
      </RigidBody>
    </group>
  );
};

/**
 * 3D Assets for Council Chamber
 */
const CouncilChamberAssets = ({ position }: { position: [number, number, number] }) => {
  const chairSeatInstances = useMemo(
    () =>
      [...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return {
          position: [x, 0.4, z] as [number, number, number],
          rotation: [0, -angle - Math.PI / 2, 0] as [number, number, number],
        };
      }),
    [],
  );

  const chairBackInstances = useMemo(
    () =>
      [...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const offsetX = Math.sin(-angle - Math.PI / 2) * 0.3;
        const offsetZ = Math.cos(-angle - Math.PI / 2) * 0.3;
        return {
          position: [x + offsetX, 1.2, z + offsetZ] as [number, number, number],
          rotation: [0, -angle - Math.PI / 2, 0] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Grand Circular Assembly Table */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[3.2, 3.2, 0.15, 32]} />
          <meshStandardMaterial color="#543015" roughness={0.3} />
        </mesh>
        {/* Table metal leg ring */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[3.0, 3.0, 0.45, 32, 1, true]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>

        {/* Instanced chair seats/backs to reduce draw calls */}
        <InstancedBoxCloud items={chairSeatInstances} baseSize={[0.8, 0.8, 0.8]} color="#1a2e40" />
        <InstancedBoxCloud items={chairBackInstances} baseSize={[0.8, 0.9, 0.15]} color="#0e1b27" />

        {/* Speaker Podium with microphone */}
        <mesh castShadow receiveShadow position={[0, 0.7, -5.5]}>
          <boxGeometry args={[1.2, 1.4, 0.8]} />
          <meshStandardMaterial color="#301c0c" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 1.6, -5.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color="#222" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.9, -5.5]}>
          <sphereGeometry args={[0.06]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </RigidBody>
    </group>
  );
};

/**
 * 3D Assets for Town Archives
 */
const TownArchivesAssets = ({ position }: { position: [number, number, number] }) => {
  const leftBooks = useMemo(
    () =>
      [...Array(5)].flatMap((_, floorIdx) =>
        [...Array(6)].map((_, bookIdx) => {
          const bookHeight = 0.5 + Math.sin(bookIdx) * 0.15;
          const xOffset = -0.9 + bookIdx * 0.36;
          const yOffset = 0.7 + floorIdx * 1.15;
          return {
            position: [xOffset, yOffset, 0.3] as [number, number, number],
            scale: [1, bookHeight, 1] as [number, number, number],
          };
        }),
      ),
    [],
  );

  const rightBooks = useMemo(
    () =>
      [...Array(5)].flatMap((_, floorIdx) =>
        [...Array(6)].map((_, bookIdx) => {
          const bookHeight = 0.5 + Math.cos(bookIdx) * 0.1;
          const xOffset = -0.9 + bookIdx * 0.36;
          const yOffset = 0.7 + floorIdx * 1.15;
          return {
            position: [xOffset, yOffset, 0.3] as [number, number, number],
            scale: [1, bookHeight, 1] as [number, number, number],
          };
        }),
      ),
    [],
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" friction={0.8}>
        {/* Bookcase Left */}
        <group position={[-3.5, 0, -4]}>
          <mesh castShadow position={[0, 3, 0]}>
            <boxGeometry args={[2.5, 6, 0.8]} />
            <meshStandardMaterial color="#2d1e15" roughness={0.5} />
          </mesh>
          {/* Instanced books */}
          <InstancedBoxCloud items={leftBooks} baseSize={[0.26, 1, 0.45]} color="#8f5a37" />
        </group>

        {/* Bookcase Right */}
        <group position={[3.5, 0, -4]}>
          <mesh castShadow position={[0, 3, 0]}>
            <boxGeometry args={[2.5, 6, 0.8]} />
            <meshStandardMaterial color="#2d1e15" roughness={0.5} />
          </mesh>
          {/* Instanced books */}
          <InstancedBoxCloud items={rightBooks} baseSize={[0.26, 1, 0.45]} color="#6b3f2a" />
        </group>

        {/* Solid Reading Desk */}
        <mesh castShadow receiveShadow position={[0, 0.5, -0.5]}>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#3d281a" roughness={0.3} />
        </mesh>
        {/* Open lore book mesh */}
        <group position={[0, 1.05, -0.5]} rotation={[-0.1, 0, 0]}>
          <mesh castShadow position={[-0.32, 0, 0]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.6]} />
            <meshStandardMaterial color="#faf9f6" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0.32, 0, 0]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.6]} />
            <meshStandardMaterial color="#faf9f6" roughness={0.9} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
};

// ----------------------------------------------------
// UI Dashboard Panels & Modals (2D HTML overlays)
// ----------------------------------------------------



/**
 * Zustand Player Stats Display Panel
 */
const GameUI = ({
  isFullscreenEnabled,
  toggleFullscreen,
  isFullscreenAvailable,
}: {
  isFullscreenEnabled: boolean;
  toggleFullscreen: () => void;
  isFullscreenAvailable: boolean;
}) => {
  const { health, coins, takeDamage, heal, addCoins, scoreMultiplier } = useGameStore();
  const { isDead, healthPercentage, totalScore } = useGameComputed();

  return (
    <div className="absolute top-5 right-5 text-white bg-slate-950/80 border border-slate-700/50 p-4 rounded-xl flex flex-col gap-2 min-w-[220px] z-40 backdrop-blur-md shadow-2xl transition duration-300 hover:border-blue-500/30">
      <h2 className="font-display text-sm font-bold tracking-widest text-yellow-400 flex items-center gap-1.5 uppercase">
        <Shield size={16} className="text-yellow-400 animate-pulse" />
        Citizen Stats
      </h2>

      {/* Health Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 mt-1">
        <div
          className={`h-full ${isDead ? "bg-red-700" : "bg-gradient-to-r from-emerald-500 to-green-400"}`}
          style={{ width: `${healthPercentage}%`, transition: "width 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)" }}
        />
      </div>

      <div className="text-xs space-y-1.5 font-mono mt-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Health:</span>
          <span className={isDead ? "text-red-500 font-bold" : "text-green-400"}>
            {health} / 100 {isDead && "💀"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Treasury Gold:</span>
          <span className="text-yellow-400 font-bold flex items-center gap-0.5">
            <Coins size={12} className="inline text-yellow-400" />
            {coins} 🪙
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-1 text-[11px]">
          <span className="text-slate-400">Score Mult:</span>
          <span className="text-blue-400 font-bold">x{scoreMultiplier.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Computed Score:</span>
          <span className="text-cyan-400 font-bold">{totalScore.toFixed(0)}</span>
        </div>
      </div>

      {/* Manual testing control suite */}
      <div className="flex gap-1.5 mt-2 pointer-events-auto">
        <button
          onClick={() => takeDamage(15)}
          className="bg-red-950/80 border border-red-700/30 text-[10px] text-red-300 py-1 rounded hover:bg-red-900 transition flex-1"
        >
          Damage
        </button>
        <button
          onClick={() => heal(20)}
          className="bg-emerald-950/80 border border-emerald-700/30 text-[10px] text-emerald-300 py-1 rounded hover:bg-emerald-900 transition flex-1"
        >
          Heal
        </button>
        <button
          onClick={() => addCoins(10)}
          className="bg-amber-950/80 border border-amber-700/30 text-[10px] text-amber-300 py-1 rounded hover:bg-amber-900 transition flex-1"
        >
          Gold
        </button>
      </div>

      {isFullscreenAvailable && (
        <button
          onClick={toggleFullscreen}
          className="mt-2.5 flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-xs py-2 rounded-lg font-bold border border-slate-600/50 pointer-events-auto transition cursor-pointer hover:border-blue-400/40"
        >
          {isFullscreenEnabled ? (
            <>
              <Minimize size={14} />
              <span>Minimize Client</span>
            </>
          ) : (
            <>
              <Maximize size={14} />
              <span>Fullscreen Mode</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Text-to-Speech Settings UI Component
 */
const SpeechUI = () => {
  const [text, setText] = useState("Greetings, welcome to the grand central hall of landless.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Auto-select English if available
      const enIdx = availableVoices.findIndex((v) => v.lang.startsWith("en-US"));
      if (enIdx !== -1) setSelectedVoiceIndex(enIdx);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectedVoice = voices[selectedVoiceIndex] || null;

  const { start, stop, isPlaying } = useSpeech({
    text,
    voiceURI: selectedVoice?.voiceURI,
    language: selectedVoice?.lang || "en-US",
  });

  return (
    <div className="absolute bottom-5 right-5 text-white bg-slate-950/80 p-4 rounded-xl flex flex-col gap-2 min-w-[240px] z-40 pointer-events-auto border border-slate-700/50 shadow-2xl backdrop-blur-md transition hover:border-pink-500/20">
      <h2 className="font-display text-xs font-bold tracking-widest text-pink-400 flex items-center gap-2 uppercase">
        <Volume2 size={16} />
        Acoustic Guide
      </h2>

      {voices.length > 0 && (
        <select
          value={selectedVoiceIndex}
          onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
          className="bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-slate-200 focus:outline-none"
        >
          {voices.map((voice, index) => (
            <option key={index} value={index}>
              {voice.name.length > 25 ? voice.name.slice(0, 25) + "..." : voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-[11px] text-white focus:outline-none focus:border-pink-500 h-14 resize-none font-sans"
        placeholder="Enter announcement text..."
      />

      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={isPlaying || !text.trim()}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition cursor-pointer ${
            isPlaying || !text.trim()
              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
              : "bg-pink-600 hover:bg-pink-500 text-white"
          }`}
        >
          <Volume2 size={12} />
          {isPlaying ? "Speaking..." : "Broadcast"}
        </button>

        <button
          onClick={stop}
          disabled={!isPlaying}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition cursor-pointer ${
            !isPlaying
              ? "bg-slate-850 text-slate-700 cursor-not-allowed opacity-30"
              : "bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-900/30"
          }`}
        >
          <StopCircle size={12} />
          Stop
        </button>
      </div>
    </div>
  );
};

export default function Play() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen({ target: containerRef });

  // Interactive Zone Trigger States
  const [activeZone, setActiveZone] = useState<ZoneInfo | null>(null);
  const [openZoneId, setOpenZoneId] = useState<string | null>(null);
  const [spokenZones, setSpokenZones] = useState<Record<string, boolean>>({});

  // Room Specific States
  // Vault Cooldown
  const [vaultCooldown, setVaultCooldown] = useState(0);
  const [vaultClaimed, setVaultClaimed] = useState(false);

  // Council Chambers Vote Simulation
  const [proposedOrdinance, setProposedOrdinance] = useState<string | null>(null);
  const [voteStage, setVoteStage] = useState<"idle" | "voting" | "finished">("idle");
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [voteLogs, setVoteLogs] = useState<string[]>([]);
  const voteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Archives Page Reader
  const [archivePage, setArchivePage] = useState(0);

  // Zustand Store variables
  const { heal, addCoins, setScoreMultiplier, coins } = useGameStore();

  // 1. Detect key E to open zone interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && activeZone) {
        setOpenZoneId(activeZone.id);
        // Play TTS narration automatically when opening dashboard
        speakTextDirect(activeZone.speechText);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZone]);

  // 2. Cooldown timer for vault claim
  useEffect(() => {
    if (vaultCooldown > 0) {
      const timer = setTimeout(() => setVaultCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [vaultCooldown]);

  // 3. Cleanup vote interval on unmount
  useEffect(() => {
    return () => {
      if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);
    };
  }, []);

  // 4. Audio Guide announcer logic (Automatic speech once per zone per session)
  const handleEnterZone = (zone: ZoneInfo) => {
    setActiveZone(zone);
    if (!spokenZones[zone.id]) {
      speakTextDirect(`Arriving at: ${zone.title}. ${zone.description}`);
      setSpokenZones((prev) => ({ ...prev, [zone.id]: true }));
    }
  };

  const handleExitZone = (id: string) => {
    setActiveZone((current) => (current?.id === id ? null : current));
  };

  // Council chamber simulated vote logic
  const handleProposeOrdinance = (name: string) => {
    if (voteStage === "voting") return;

    setProposedOrdinance(name);
    setVoteStage("voting");
    setYesVotes(0);
    setNoVotes(0);
    setVoteLogs(["Ordinance introduced on the assembly floor...", "Speaker: Debate is now open."]);

    speakTextDirect(`Proposing city ordinance: ${name}. Assembly is now voting.`);

    let count = 0;
    const logs = [
      "Councilor Aaron: This represents severe progress for our monorepo!",
      "Councilor Beatrice: The visual aesthetics are outstanding, I approve.",
      "Councilor Cedric: Will this cause performance regressions in the frame rates?",
      "Councilor Delilah: Our treasury has sufficient funding, let us build it.",
      "Councilor Eugene: Monorepos are the foundation of modern digital states!",
      "Councilor Fiona: Friction settings look highly tuned, yes!",
      "Councilor Gregory: I must register a minor objection regarding the colors.",
    ];

    if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);

    voteIntervalRef.current = setInterval(() => {
      count++;
      setYesVotes((y) => y + Math.floor(Math.random() * 15) + 8);
      setNoVotes((n) => n + Math.floor(Math.random() * 8) + 2);

      if (count <= logs.length) {
        setVoteLogs((prev) => [...prev, logs[count - 1]]);
      }

      if (count >= 5) {
        if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);
        setVoteStage("finished");

        // Resolve final vote
        setYesVotes((prevYes) => {
          setNoVotes((prevNo) => {
            const passed = prevYes > prevNo;
            if (passed) {
              addCoins(25);
              speakTextDirect(`Ordinance passed with ${prevYes} votes! The treasury has rewarded you 25 gold.`);
              setVoteLogs((p) => [...p, "🏆 ORDINANCE PASSED! 25 Coins distributed to proposer."]);
            } else {
              speakTextDirect("Ordinance rejected by the council.");
              setVoteLogs((p) => [...p, "❌ ORDINANCE REJECTED. Proposer failed to secure majority."]);
            }
            return prevNo;
          });
          return prevYes;
        });
      }
    }, 900);
  };

  // Archives pages definitions
  const archivePages = [
    {
      title: "Volume I: The Monorepo Genesis",
      content:
        "Before the great convergence, developers roamed in separate repositories, lost in dependency conflicts. Then came the great Monorepo structure, uniting the Next.js Game Client and the PostgreSQL Game Server under a single package manager. Standardized linting and shared assets bound the kingdoms together, achieving absolute builds and unified exports.",
    },
    {
      title: "Volume II: The Riddle of Rapier",
      content:
        "Physics was but a dream until the Rapier engine was forged. The floating capsule controllers, once sliding aimlessly in frictionless vacuum, were given mass, friction, and gravity. Ground meshes were given solid colliders and precise friction coefficients, enabling players to sprint, jump, and interact with the physical objects of the realm.",
    },
    {
      title: "Volume III: The Statue Prophecy",
      content:
        "Legend tells of a magnificent monument that will stand in the center of the City Hall. Though today only a glowing holographic energy matrix floats upon the pedestal, the ancient developer scrolls foretell of an engineer who will write a Statue schema into the database, model a gorgeous polygon structure, and materialize the monument for all to witness.",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={`play-page ${playPageFontClassName} w-full h-screen bg-[#07080b] overflow-hidden select-none`}
    >
      <Canvas
        camera={{ position: [0, 8, 26], fov: 42 }}
        gl={{ antialias: true }}
        eventSource={typeof window !== "undefined" ? document.body : undefined}
        dpr={1}
      >
        <Suspense fallback={null}>
          <Perf position="bottom-left" />
          <Sky sunPosition={[120, 30, 80]} turbidity={8} rayleigh={2} mieCoefficient={0.005} />

          <PerformanceMonitor bounds={() => [45, 60]}>
            {/* <AdaptiveDpr /> */}
            <AdaptiveEvents />

            {/* Architectural Ambient & Direct Lights */}
            <ambientLight intensity={4.8} color="#f2f8ff" />
            <hemisphereLight color="#eaf4ff" groundColor="#253040" intensity={3.4} />
            <directionalLight
              position={[20, 25, 15]}
              intensity={2.2}
            />
            <directionalLight position={[-20, 18, -10]} intensity={1.6} color="#dbeeff" />

            {/* Subdued overhead blue light for neoclassical aesthetic */}
            <pointLight position={[0, 8, 0]} intensity={4.5} distance={45} color="#59b8ff" />
            <pointLight position={[-20, 6, -15]} intensity={3.5} distance={35} color="#79a3ff" />
            <pointLight position={[20, 6, -15]} intensity={3.5} distance={35} color="#ffd980" />
            <pointLight position={[-20, 6, 15]} intensity={3.5} distance={35} color="#7df0bf" />
            <pointLight position={[20, 6, 15]} intensity={3.5} distance={35} color="#ba9cff" />

            <Physics debug={false} timeStep="vary" gravity={[0, -9.81, 0]}>
              {/* Character Controller - Spawned safely in front lobby */}
              <Ecctrl
                position={[0, 2, 34]}
                maxVelLimit={7}
                jumpVel={5.5}
                camInitDis={-8}
                camMaxDis={-16}
                camMinDis={-0.1}
                camFollowMult={1000}
                camLerpMult={1000}
                turnVelMultiplier={1}
                turnSpeed={100}
                mode="CameraBasedMovement"
                disableControl={!!openZoneId} // Freeze player controls when dashboard is open!
              >
                <mesh>
                  <capsuleGeometry args={[0.4, 0.7]} />
                  <meshStandardMaterial color="#ffd700" roughness={0.1} metalness={0.9} />
                </mesh>
              </Ecctrl>

              {/* Neoclassical Floor, Dividing Walls & Columns */}
              <CityHallArchitecture />

              {/* Statue Pedestal & Glowing Spinning Holographic Crystal */}
              <StatuePlaceholder position={[0, 0, 0]} />

              {/* 5 Distinct Interactive Rooms Assets & Sensors */}

              {/* 1. Tourist Info Desk in Entrance Lobby */}
              <TouristDeskAssets position={[0, 0, 24]} />
              <InteractiveZone
                id="tourist"
                position={[0, 0.5, 21]}
                radius={2.8}
                color="#00f0ff"
                title="Info Desk"
                description="The welcoming desk of Landless City Hall. Interact to hear the guidance narration or view details about the chambers."
                actionText="Consult Guide"
                speechText="Welcome to the Grand City Hall of Land of Landless. Walk around to visit the Treasury, the Council Chamber, the Archives, or the Mayor's Office. Be sure to check out the central Monument Plaza!"
                onEnterZone={handleEnterZone}
                onExitZone={handleExitZone}
              />

              {/* 2. Mayor's Office (Back-Left Wing) */}
              <MayorsOfficeAssets position={[-24, 0, -22]} />
              <InteractiveZone
                id="mayor"
                position={[-24, 0.5, -18]}
                radius={3.0}
                color="#0066ff"
                title="Mayor's Study"
                description="The high-office of executive power. Interact to draft legislation and sign national decrees to alter your character statistics."
                actionText="Sign Executive Decree"
                speechText="Enter the Mayor's private study. You can review city documents and issue executive decrees to alter local parameters."
                onEnterZone={handleEnterZone}
                onExitZone={handleExitZone}
              />

              {/* 3. City Treasury Vault (Back-Right Wing) */}
              <TreasuryVaultAssets position={[24, 0, -22]} />
              <InteractiveZone
                id="treasury"
                position={[24, 0.5, -18]}
                radius={3.0}
                color="#ffaa00"
                title="Treasury Vault"
                description="Secure vault harboring the tax funds of the state. Interact to withdraw your daily citizen gold stipend."
                actionText="Collect Peasant Tax"
                speechText="Access the high-security bank vault. Under the Landless Charter, you are entitled to claim daily tax revenues collected from the peasants."
                onEnterZone={handleEnterZone}
                onExitZone={handleExitZone}
              />

              {/* 4. Council Chambers (Front-Left Wing) */}
              <CouncilChamberAssets position={[-24, 0, 18]} />
              <InteractiveZone
                id="council"
                position={[-24, 0.5, 12]}
                radius={3.2}
                color="#00ff66"
                title="Council Chambers"
                description="The assembly house of regional representation. Propose standard bills at the microphone podium and see live council voting."
                actionText="Address the Council"
                speechText="Propose a city ordinance at the grand speaker podium and watch the council representatives vote in real time."
                onEnterZone={handleEnterZone}
                onExitZone={handleExitZone}
              />

              {/* Friction Balls — kick them around! */}
              <FrictionBall position={[8, 2, 30]} color="#ff4488" friction={0.6} restitution={0.55} />
              <FrictionBall position={[-6, 2, 28]} color="#00f0ff" friction={0.4} restitution={0.7} emissiveIntensity={1.0} />
              <FrictionBall position={[5, 2, -10]} color="#ffcc00" radius={0.6} friction={0.8} restitution={0.35} emissiveIntensity={0.6} />
              <FrictionBall position={[-30, 2, 5]} color="#aa00ff" friction={0.3} restitution={0.8} emissiveIntensity={0.9} />
              <FrictionBall position={[30, 2, 5]} color="#00ff88" radius={0.35} friction={0.9} restitution={0.2} emissiveIntensity={0.7} />

              {/* 5. Town Archives & Library (Front-Right Wing) */}
              <TownArchivesAssets position={[24, 0, 18]} />
              <InteractiveZone
                id="archives"
                position={[24, 0.5, 12]}
                radius={3.0}
                color="#aa00ff"
                title="Town Archives"
                description="Historic repository of ancient manuscripts. Interact to read through the multi-chapter mythology of the developers."
                actionText="Read Ancient Books"
                speechText="Peruse the historical records and ancient lore of the Land of Landless."
                onEnterZone={handleEnterZone}
                onExitZone={handleExitZone}
              />
            </Physics>

          </PerformanceMonitor>
          <Preload all />
        </Suspense>
      </Canvas>

      {/* Standard Title & Controls overlay */}
      <div className="absolute top-5 left-5 text-white bg-slate-950/70 p-4 rounded-xl border border-slate-700/50 pointer-events-none z-30 backdrop-blur-md">
        <h1 className="font-display text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase flex items-center gap-1.5">
          <Sparkles size={16} className="text-cyan-400" />
          LOL: City Hall
        </h1>
        <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">WASD</kbd> or
          <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">↑↓←→</kbd> : Move
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">SPACE</kbd> : Jump
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">SHIFT</kbd> : Sprint
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-sans text-[9px]">MOUSE</kbd> : Look Around
        </p>
      </div>

      {/* Stats UI panel */}
      <GameUI
        isFullscreenEnabled={isFullscreenEnabled}
        toggleFullscreen={toggleFullscreen}
        isFullscreenAvailable={isFullscreenAvailable}
      />

      {/* TTS UI Generator Panel */}
      <SpeechUI />

      {/* ----------------------------------------------------
          Interactive Zone Floating Banner
      ---------------------------------------------------- */}
      {activeZone && !openZoneId && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 transition animate-fade-in pointer-events-auto">
          <div
            className="flex flex-col gap-2 p-4 text-white bg-slate-950/90 border rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300"
            style={{ borderColor: `${activeZone.color}66` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
                style={{ backgroundColor: `${activeZone.color}22`, color: activeZone.color }}
              >
                Area Detected
              </span>
              <button
                onClick={() => speakTextDirect(activeZone.speechText)}
                className="text-slate-400 hover:text-white transition"
                title="Hear Guide"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <h3 className="text-sm font-bold tracking-wide font-display" style={{ color: activeZone.color }}>
              {activeZone.title}
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{activeZone.description}</p>

            <button
              onClick={() => {
                setOpenZoneId(activeZone.id);
                speakTextDirect(activeZone.speechText);
              }}
              className="mt-1 flex items-center justify-center gap-1.5 w-full bg-white hover:bg-slate-200 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md"
            >
              <FileText size={14} />
              {activeZone.actionText} (Press E)
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          IMMERSIVE ROOM DASHBOARD MODALS
      ---------------------------------------------------- */}
      {openZoneId && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
          {/* TOURIST GUIDE MODAL */}
          {openZoneId === "tourist" && (
            <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-cyan-400 text-sm flex items-center gap-2">
                  <HelpCircle size={16} />
                  TOURIST NARRATION CENTER
                </h3>
                <button
                  onClick={() => speakTextDirect(activeZone?.speechText || "")}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded p-1.5 transition"
                  title="Replay guide voice"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-xs leading-relaxed font-sans text-slate-200">
                <div className="flex justify-center my-1.5 animate-pulse">
                  <div className="w-16 h-16 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-400">
                    <Sparkles size={32} />
                  </div>
                </div>
                <p>
                  Welcome, traveler. You are currently standing in the majestic{" "}
                  <strong className="text-white">Entrance Hall</strong>. From here, you have permission
                  to access all public and executive sections of the Land of Landless central government:
                </p>
                <div className="space-y-2.5 font-mono text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <strong className="text-blue-400 w-28 inline-block">Mayor&apos;s Office:</strong> Enact executive decrees
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <strong className="text-yellow-400 w-28 inline-block">Treasury Vault:</strong> Claim citizen tax allocations
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <strong className="text-green-400 w-28 inline-block">Council Hall:</strong> Vote on proposed legislative acts
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <strong className="text-purple-400 w-28 inline-block">Archives Desk:</strong> Read historic developer journals
                  </p>
                </div>
                <p className="text-slate-400 text-[11px] text-center border-t border-slate-900 pt-3">
                  Please explore the rooms to activate their dashboard terminals.
                </p>
              </div>
              <div className="bg-slate-900/40 p-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setOpenZoneId(null)}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Exit Terminal
                </button>
              </div>
            </div>
          )}

          {/* MAYOR'S OFFICE DECREE PARCHMENT */}
          {openZoneId === "mayor" && (
            <div className="w-full max-w-lg bg-[#f9f5eb] border-[6px] border-[#3e2723] rounded-lg shadow-2xl p-6 text-slate-800 relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
              <div className="text-center space-y-1 border-b border-[#3e2723]/30 pb-4">
                <h4 className="font-serif italic text-xs tracking-widest text-[#5d4037] uppercase">
                  State of Landless
                </h4>
                <h3 className="font-serif font-black text-2xl tracking-wider text-[#3e2723] flex items-center justify-center gap-2">
                  <FileText size={24} className="text-[#3e2723]" />
                  OFFICIAL EXECUTIVE DECREE
                </h3>
                <p className="text-[10px] italic font-serif text-[#795548]">
                  By Decree of the appointed Deputy Mayor
                </p>
              </div>

              <div className="my-6 space-y-4">
                <p className="text-xs italic font-serif text-slate-700 text-center">
                  Select one administrative decree to stamp into law. Enacting a decree immediately adjusts
                  national parameters and awards specific status rewards.
                </p>

                <div className="space-y-3 mt-4">
                  {/* Decree Option 1 */}
                  <button
                    onClick={() => {
                      addCoins(100);
                      speakTextDirect("Decree signed! Glitch tax enacted. 100 gold coins added.");
                      setOpenZoneId(null);
                    }}
                    className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
                  >
                    <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
                      <span>I. LEVY PHYSICS GLITCH TAX</span>
                      <span className="text-[10px] font-mono bg-amber-800 text-white px-2 py-0.5 rounded">
                        REWARD: +100 Coins 🪙
                      </span>
                    </h4>
                    <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
                    &quot;Citizens reporting strange gravity fluctuations, floating capsules, or infinite bounce
                    distortions shall pay a levy to the high-court. Fills treasury immediately.&quot;
                    </p>
                  </button>

                  {/* Decree Option 2 */}
                  <button
                    onClick={() => {
                      setScoreMultiplier(2.5);
                      speakTextDirect("Decree signed! Monorepo standardization act enacted. Multiplier increased to 2.5.");
                      setOpenZoneId(null);
                    }}
                    className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
                  >
                    <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
                      <span>II. STANDARDIZE MONOREPO FORMATTING</span>
                      <span className="text-[10px] font-mono bg-blue-800 text-white px-2 py-0.5 rounded">
                        REWARD: x2.5 Multiplier 📈
                      </span>
                    </h4>
                    <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
                    &quot;Enforces a strict linting code formatting index and centralized environment variables
                    across all provinces. Boosts computed score outputs significantly.&quot;
                    </p>
                  </button>

                  {/* Decree Option 3 */}
                  <button
                    onClick={() => {
                      heal(100);
                      speakTextDirect("Decree signed! Public health mandate active. Character fully healed.");
                      setOpenZoneId(null);
                    }}
                    className="w-full text-left p-3.5 bg-[#f0e6d2] border border-[#a1887f] rounded hover:bg-[#e4d5b7] transition group cursor-pointer"
                  >
                    <h4 className="font-serif font-bold text-sm text-[#3e2723] flex items-center justify-between">
                      <span>III. CONSOLIDATED CITIZEN HEALTH ACT</span>
                      <span className="text-[10px] font-mono bg-emerald-800 text-white px-2 py-0.5 rounded">
                        REWARD: FULL HEAL (100 HP) 💖
                      </span>
                    </h4>
                    <p className="text-[11px] font-serif text-slate-700 italic mt-1 leading-relaxed">
                    &quot;Mandates that the Ministry of Alchemy dispense immediate, high-grade potion reserves to
                    fully restore any damaged player statistics.&quot;
                    </p>
                  </button>
                </div>
              </div>

              <div className="border-t border-[#3e2723]/30 pt-4 flex justify-between items-center">
                <span className="text-[10px] font-serif italic text-slate-500">
                  Signed: Deputy Mayor Antigravity
                </span>
                <button
                  onClick={() => setOpenZoneId(null)}
                  className="bg-[#3e2723] hover:bg-[#5d4037] text-[#f9f5eb] font-serif font-bold px-4 py-1.5 rounded text-xs transition cursor-pointer"
                >
                  Cancel Decree
                </button>
              </div>
            </div>
          )}

          {/* TREASURY VAULT KEYPAD TERMINAL */}
          {openZoneId === "treasury" && (
            <div className="w-full max-w-sm bg-slate-950 border border-yellow-500/50 rounded-2xl shadow-2xl text-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-display font-bold text-yellow-400 text-xs flex items-center gap-1.5 tracking-wider">
                  <Coins size={16} className="text-yellow-400" />
                  TREASURY VAULT TERMINAL
                </h3>
                <span className="font-mono text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full uppercase animate-pulse">
                  Ready
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vault Secure State:</span>
                  <span className="text-green-400 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total peasant tax:</span>
                  <span className="text-yellow-400 font-bold">450 Gold 🪙</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Claim Allocation:</span>
                  <span className="text-white">+50 Coins per request</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-[10px]">
                  <span className="text-slate-400">Your Current Wallet:</span>
                  <span className="text-cyan-400">{coins} Coins</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {vaultCooldown > 0 ? (
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center font-mono text-[11px] text-yellow-500">
                    🔒 VAULT DOORS SECURED. COOLDOWN IN PROGRESS ({vaultCooldown}s)
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      addCoins(50);
                      setVaultCooldown(25);
                      setVaultClaimed(true);
                      speakTextDirect("Transaction complete. 50 coins successfully withdrawn. Vault closing.");
                    }}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Coins size={14} />
                    CLAIM TAX ALLOCATION (+50 Coins)
                  </button>
                )}

                {vaultClaimed && (
                  <p className="text-[10px] text-green-400 text-center font-mono animate-fade-in flex items-center justify-center gap-1">
                    <Check size={12} /> Claim complete! Check top-right stats wallet.
                  </p>
                )}
              </div>

              <div className="flex justify-end border-t border-slate-900 pt-3">
                <button
                  onClick={() => setOpenZoneId(null)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-700 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                >
                  Close Vault
                </button>
              </div>
            </div>
          )}

          {/* COUNCIL CHAMBERS LEGISLATION DEBATE */}
          {openZoneId === "council" && (
            <div className="w-full max-w-lg bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl text-white p-5 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
                <h3 className="font-display font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Vote size={18} />
                  LEGISLATIVE CHAMBER DIAS
                </h3>
                <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                  Session Active
                </span>
              </div>

              {voteStage === "idle" ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans text-center italic">
                    Approach the speaker&apos;s podium. Select one city proposal to introduce on the floor.
                    The representative councilors will debate and cast real-time votes.
                  </p>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleProposeOrdinance("The Public Double Jump Subsidy Act")}
                      className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
                    >
                      <h4 className="font-bold text-xs text-white">1. Double Jump Subsidy Act</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Funds public high-frequency jump thrusters. Upgrades standard player capsule jump heights.
                      </p>
                    </button>
                    <button
                      onClick={() => handleProposeOrdinance("The Anti-Friction Regulation")}
                      className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
                    >
                      <h4 className="font-bold text-xs text-white">2. Anti-Friction Regulation</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Reduces overall platform friction ratios. Forces extreme slipperiness across obstacle ramps.
                      </p>
                    </button>
                    <button
                      onClick={() => handleProposeOrdinance("The Developer Beverage Mandate")}
                      className="w-full text-left p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer"
                    >
                      <h4 className="font-bold text-xs text-white">3. Developer Beverage Mandate</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Allocates direct funds to provide caffeinated beverages to working programmers.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block text-center">
                      Active Bill:
                    </span>
                    <h4 className="text-center font-bold text-sm text-white px-4">
                      &quot;{proposedOrdinance}&quot;
                    </h4>

                    {/* Progress vote bars */}
                    <div className="space-y-2.5 bg-slate-900 p-4 rounded-xl border border-slate-850">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-green-400 font-bold">YES VOTES:</span>
                          <span className="text-white">{yesVotes}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-full transition-all duration-300"
                            style={{ width: `${(yesVotes / (yesVotes + noVotes || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-red-400 font-bold">NO VOTES:</span>
                          <span className="text-white">{noVotes}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 h-full transition-all duration-300"
                            style={{ width: `${(noVotes / (yesVotes + noVotes || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debating logs */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 h-32 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
                    {voteLogs.map((log, idx) => (
                      <p key={idx} className={idx === voteLogs.length - 1 ? "text-emerald-300 font-bold" : ""}>
                        {log}
                      </p>
                    ))}
                  </div>

                  {voteStage === "finished" && (
                    <button
                      onClick={() => setVoteStage("idle")}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Submit Another Bill
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-900 pt-3 mt-4">
                <button
                  onClick={() => {
                    setOpenZoneId(null);
                    setVoteStage("idle");
                  }}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Exit Chamber
                </button>
              </div>
            </div>
          )}

          {/* TOWN ARCHIVES paginated lore book */}
          {openZoneId === "archives" && (
            <div className="w-full max-w-xl bg-[#faf6ee] border-2 border-amber-900/40 rounded-xl shadow-2xl p-6 text-stone-900 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
                  <h3 className="font-serif font-black tracking-widest text-[#3e2723] text-sm flex items-center gap-2">
                    <BookOpen size={18} />
                    CHRONICLES OF LANDLESS
                  </h3>
                  <span className="font-serif text-[10px] text-amber-800 uppercase italic">
                    Lore Book: Vol. {archivePage + 1}
                  </span>
                </div>

                <div className="my-5 space-y-3 font-serif">
                  <h4 className="text-base font-bold text-[#5d4037] border-b border-stone-300 pb-1.5">
                    {archivePages[archivePage].title}
                  </h4>
                  <p className="text-xs leading-relaxed text-stone-800 text-justify indent-6">
                    {archivePages[archivePage].content}
                  </p>
                </div>
              </div>

              <div className="border-t border-amber-900/20 pt-4 flex justify-between items-center">
                <button
                  onClick={() => speakTextDirect(archivePages[archivePage].content)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300 px-3 py-1.5 rounded text-[11px] transition flex items-center gap-1 font-sans cursor-pointer font-bold"
                  title="Hear active page text"
                >
                  <Volume2 size={13} />
                  Hear Lore Page
                </button>

                <div className="flex gap-2 font-sans text-xs">
                  <button
                    onClick={() => setArchivePage((p) => Math.max(0, p - 1))}
                    disabled={archivePage === 0}
                    className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                      archivePage === 0
                        ? "text-stone-300 border-stone-200 bg-stone-50 cursor-not-allowed"
                        : "text-stone-800 border-stone-300 bg-stone-200 hover:bg-stone-300"
                    }`}
                  >
                    Back Page
                  </button>
                  <button
                    onClick={() => setArchivePage((p) => Math.min(archivePages.length - 1, p + 1))}
                    disabled={archivePage === archivePages.length - 1}
                    className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                      archivePage === archivePages.length - 1
                        ? "text-stone-300 border-stone-200 bg-stone-50 cursor-not-allowed"
                        : "text-stone-800 border-stone-300 bg-stone-200 hover:bg-stone-300"
                    }`}
                  >
                    Next Page
                  </button>
                  <button
                    onClick={() => {
                      setOpenZoneId(null);
                      setArchivePage(0);
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    Close Archives
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
