import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import {
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  Environment,
  Grid,
  Sky,
  ContactShadows,
} from "@react-three/drei";
import Ecctrl, { EcctrlJoystick } from "ecctrl";
import { Suspense } from "react";
import { useGameStore, useGameComputed } from "../stores/gameStore";

/**
 * Zustand Store UI Component
 */
const GameUI = () => {
  const { health, coins, takeDamage, heal, addCoins } = useGameStore();
  const { isDead, healthPercentage, totalScore } = useGameComputed();

  return (
    <div className="absolute top-5 right-5 text-white bg-black/60 p-4 rounded-lg font-mono flex flex-col gap-2 min-w-[200px] z-50">
      <h2 className="text-lg font-bold text-yellow-400">Player Stats</h2>

      <div className="w-full bg-gray-700 h-3 rounded mt-1 overflow-hidden">
        <div
          className={`h-full ${isDead ? "bg-red-700" : "bg-green-500"}`}
          style={{ width: `${healthPercentage}%`, transition: "width 0.3s" }}
        />
      </div>

      <div className="text-sm space-y-1">
        <p>
          Health:{" "}
          <span className={isDead ? "text-red-500" : ""}>{health} / 100</span>{" "}
          {isDead && "💀"}
        </p>
        <p>
          Base Coins: <span className="text-yellow-400">{coins}</span>
        </p>
        <p className="text-xs text-slate-300 border-t border-slate-600 pt-1 mt-1">
          Computed Score (x1.5):{" "}
          <span className="text-green-400 font-bold">{totalScore}</span>
        </p>
      </div>

      <div className="flex gap-2 mt-2 pointer-events-auto">
        <button
          onClick={() => takeDamage(15)}
          className="bg-red-500/80 px-2 py-1 rounded hover:bg-red-500 text-xs font-bold w-full transition"
        >
          -15 HP
        </button>
        <button
          onClick={() => heal(20)}
          className="bg-green-500/80 px-2 py-1 rounded hover:bg-green-500 text-xs font-bold w-full transition"
        >
          +20 HP
        </button>
        <button
          onClick={() => addCoins(10)}
          className="bg-yellow-500/80 px-2 py-1 rounded hover:bg-yellow-500 text-xs text-black font-bold w-full transition"
        >
          +10 🪙
        </button>
      </div>
    </div>
  );
};

/**
 * Obstacle Component
 */
const Obstacle = ({ position, args = [2, 2, 2], color = "orange" }: any) => (
  <RigidBody position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
);

/**
 * Ball Component (Physics test)
 */
const PhysicsBall = ({ position }: any) => (
  <RigidBody position={position} colliders="ball">
    <mesh castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="cyan" roughness={0} metalness={0.5} />
    </mesh>
  </RigidBody>
);

export default function Play() {
  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden">
      {/* Mobile Joystick */}
      <EcctrlJoystick />

      <Canvas
        shadows
        camera={{ position: [0, 10, 20], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        eventSource={typeof window !== "undefined" ? document.body : undefined}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />

          <PerformanceMonitor bounds={(refreshRate) => [45, 60]} flipflops={5}>
            <AdaptiveDpr />
            <AdaptiveEvents />

            <ambientLight intensity={1.5} />
            <directionalLight
              castShadow
              position={[10, 20, 10]}
              intensity={2}
              shadow-mapSize={[1024, 1024]}
            />

            <Physics debug={false} gravity={[0, -9.81, 0]}>
              {/* Character Controller */}
              <Ecctrl
                position={[0, 2, 0]}
                maxVelLimit={7}
                jumpVel={5}
                camInitDis={-10}
                camMaxDis={-20}
                camMinDis={-0.1}
              >
                <mesh castShadow>
                  <capsuleGeometry args={[0.4, 0.7]} />
                  <meshStandardMaterial color="yellow" />
                </mesh>
              </Ecctrl>

              {/* Ground & Environment */}
              <RigidBody type="fixed">
                <Grid
                  infiniteGrid
                  fadeDistance={50}
                  fadeStrength={5}
                  sectionSize={1}
                  sectionColor="#444"
                  cellColor="#222"
                />
                <mesh receiveShadow position={[0, -0.5, 0]}>
                  <boxGeometry args={[100, 1, 100]} />
                  <meshStandardMaterial color="#1a1a1a" />
                </mesh>
              </RigidBody>

              {/* Obstacle Course */}
              {/* Main platforms */}
              <Obstacle
                position={[0, 0.5, -10]}
                args={[10, 1, 5]}
                color="royalblue"
              />
              <Obstacle
                position={[5, 1.5, -15]}
                args={[3, 3, 3]}
                color="crimson"
              />
              <Obstacle
                position={[-5, 2.5, -20]}
                args={[4, 1, 4]}
                color="forestgreen"
              />

              {/* Ramp */}
              <RigidBody
                type="fixed"
                rotation={[-Math.PI / 6, 0, 0]}
                position={[0, 0.5, -25]}
              >
                <mesh receiveShadow>
                  <boxGeometry args={[5, 0.5, 10]} />
                  <meshStandardMaterial color="darkorange" />
                </mesh>
              </RigidBody>

              {/* Floating path */}
              <Obstacle
                position={[10, 4, -30]}
                args={[2, 0.5, 2]}
                color="gold"
              />
              <Obstacle
                position={[14, 5, -35]}
                args={[2, 0.5, 2]}
                color="gold"
              />
              <Obstacle
                position={[10, 6, -40]}
                args={[2, 0.5, 2]}
                color="gold"
              />

              {/* Physics interaction balls */}
              <PhysicsBall position={[2, 10, -5]} />
              <PhysicsBall position={[0, 10, -5]} />
              <PhysicsBall position={[-2, 10, -5]} />

              {/* Walls to stay in bounds */}
              <RigidBody type="fixed" position={[0, 2, 50]}>
                <mesh>
                  <boxGeometry args={[100, 5, 1]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
              </RigidBody>
              <RigidBody type="fixed" position={[0, 2, -50]}>
                <mesh>
                  <boxGeometry args={[100, 5, 1]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
              </RigidBody>
              <RigidBody type="fixed" position={[50, 2, 0]}>
                <mesh>
                  <boxGeometry args={[1, 5, 100]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
              </RigidBody>
              <RigidBody type="fixed" position={[-50, 2, 0]}>
                <mesh>
                  <boxGeometry args={[1, 5, 100]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
              </RigidBody>
            </Physics>

            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.4}
              scale={100}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />
          </PerformanceMonitor>
          <Preload all />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-5 left-5 text-white bg-black/50 p-4 rounded-lg pointer-events-none font-mono z-50">
        <h1 className="text-xl font-bold mb-2">LOL: Land of Landless</h1>
        <p className="text-sm opacity-80">WASD / ↑↓←→ : Move</p>
        <p className="text-sm opacity-80">SPACE : Jump</p>
        <p className="text-sm opacity-80">SHIFT : Sprint</p>
        <p className="text-sm opacity-80">MOUSE : Orbit Camera</p>
      </div>

      <GameUI />
    </div>
  );
}
