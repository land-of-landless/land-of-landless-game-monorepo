import { RigidBody } from "@react-three/rapier";
import { InteractiveZoneVisual } from "./InteractiveZoneVisual";
import { InteractiveZoneProps } from "../../lib/types";

/**
 * Rapier Physics Sensor Zone
 */
export const InteractiveZone = ({
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
