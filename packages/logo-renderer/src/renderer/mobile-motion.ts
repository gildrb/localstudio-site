import { ENV_BASE_YAW, ENV_HORIZONTAL_YAW_RANGE } from "./runtime/environment-input";

export const MOBILE_AUTO_ROTATE_SPEED = 0.15;

export type EvePointerInteractionMode = {
  paintEnabled: boolean;
  autoRotateEnvYaw: boolean;
};

export function evePointerInteractionMode(isCoarsePointer: boolean): EvePointerInteractionMode {
  return {
    paintEnabled: !isCoarsePointer,
    autoRotateEnvYaw: isCoarsePointer,
  };
}

export function mobileAutoEnvYaw(timeSeconds: number) {
  return ENV_BASE_YAW + Math.sin(timeSeconds * MOBILE_AUTO_ROTATE_SPEED) * ENV_HORIZONTAL_YAW_RANGE;
}
