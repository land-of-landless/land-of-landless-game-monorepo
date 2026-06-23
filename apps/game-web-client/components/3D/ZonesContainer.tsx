import { ZONES_CONFIG } from "../../config/gameConfig";
import { InteractiveZone } from "./InteractiveZone";
import { ZoneInfo } from "../../lib/types";

/**
 * Interactive Zones Container Component
 * Renders all 5 interactive zones from configuration
 */

interface ZonesContainerProps {
  /** Callback when player enters a zone */
  onEnterZone: (zone: ZoneInfo) => void;
  /** Callback when player exits a zone */
  onExitZone: (id: string) => void;
}

export const ZonesContainer = ({
  onEnterZone,
  onExitZone,
}: ZonesContainerProps) => {
  return (
    <>
      {Object.values(ZONES_CONFIG).map((zoneConfig) => (
        <InteractiveZone
          key={zoneConfig.id}
          id={zoneConfig.id}
          position={zoneConfig.position}
          radius={zoneConfig.radius}
          color={zoneConfig.color}
          title={zoneConfig.title}
          description={zoneConfig.description}
          actionText={zoneConfig.actionText}
          speechText={zoneConfig.speechText}
          onEnterZone={onEnterZone}
          onExitZone={onExitZone}
        />
      ))}
    </>
  );
};
