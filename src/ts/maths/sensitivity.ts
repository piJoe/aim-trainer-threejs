import { MathUtils } from "three";

export function calculateSensitivityByCmPer360(
  cmPer360: number,
  dpi: number
): number {
  return MathUtils.degToRad(360 / cmPer360 / (dpi / 2.54));
}
