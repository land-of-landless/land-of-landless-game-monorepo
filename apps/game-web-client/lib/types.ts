/**
 * Shared type definitions for the game
 */

export interface ZoneInfo {
  id: string;
  title: string;
  description: string;
  actionText: string;
  color: string;
  speechText: string;
}

export interface InteractiveZoneProps {
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
