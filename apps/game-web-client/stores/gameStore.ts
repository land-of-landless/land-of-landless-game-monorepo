import { create } from "zustand";

interface GameState {
  health: number;
  maxHealth: number;
  coins: number;
  scoreMultiplier: number;

  // Actions
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addCoins: (amount: number) => void;
}

interface GameComputed {
  isDead: boolean;
  healthPercentage: number;
  totalScore: number;
  canBuyItem: (cost: number) => boolean;
}

// 1. Base State Store
export const useGameStore = create<GameState>()((set) => ({
  health: 100,
  maxHealth: 100,
  coins: 0,
  scoreMultiplier: 1.5,

  takeDamage: (amount) =>
    set((state) => ({ health: Math.max(0, state.health - amount) })),
  heal: (amount) =>
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + amount),
    })),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
}));

// 2. Computed State Hook (Raw Zustand Implementation)
// Derives state dynamically when base state changes.
export const useGameComputed = (): GameComputed => {
  const health = useGameStore((state) => state.health);
  const maxHealth = useGameStore((state) => state.maxHealth);
  const coins = useGameStore((state) => state.coins);
  const scoreMultiplier = useGameStore((state) => state.scoreMultiplier);

  return {
    isDead: health <= 0,
    healthPercentage: (health / maxHealth) * 100,
    totalScore: coins * scoreMultiplier,
    canBuyItem: (cost: number) => coins >= cost,
  };
};
