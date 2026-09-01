const ENV_EFFECTIVE_HALF_WIDTH_RATIO = 0.5;
const ENV_EFFECTIVE_HALF_HEIGHT_RATIO = 0.75;
export const ENV_BASE_YAW = 1.15;
export const ENV_HORIZONTAL_YAW_RANGE = 0.35;
const ENV_VERTICAL_PITCH_RANGE = 0.24;

function clampSigned(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function mapPointerToLocalEnvironment({
  clientX,
  clientY,
  rect,
}: {
  clientX: number;
  clientY: number;
  rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;
}) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const normalizedX = clampSigned(
    (clientX - centerX) / Math.max(1, rect.width * ENV_EFFECTIVE_HALF_WIDTH_RATIO),
  );
  const normalizedY = clampSigned(
    (clientY - centerY) / Math.max(1, rect.height * ENV_EFFECTIVE_HALF_HEIGHT_RATIO),
  );
  return {
    envYaw: ENV_BASE_YAW + normalizedX * ENV_HORIZONTAL_YAW_RANGE,
    envPitch: normalizedY * ENV_VERTICAL_PITCH_RANGE,
    normalizedX,
    normalizedY,
  };
}
