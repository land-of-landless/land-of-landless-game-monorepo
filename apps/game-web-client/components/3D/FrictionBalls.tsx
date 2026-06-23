import { FRICTION_BALLS_CONFIG } from "../../config/gameConfig";
import { FrictionBall } from "./FrictionBall";

/**
 * Friction Balls Container Component
 * Renders all 5 interactive friction balls from configuration
 */

export const FrictionBalls = () => {
  return (
    <>
      {FRICTION_BALLS_CONFIG.map((ballConfig) => (
        <FrictionBall
          key={ballConfig.id}
          position={ballConfig.position}
          color={ballConfig.color}
          friction={ballConfig.friction}
          restitution={ballConfig.restitution}
          radius={ballConfig.radius}
          emissiveIntensity={ballConfig.emissiveIntensity}
        />
      ))}
    </>
  );
};
