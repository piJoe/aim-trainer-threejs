import { calculateSensitivityByCmPer360 } from "./maths/sensitivity";

let settings = {
  mouseSensitivity: calculateSensitivityByCmPer360(35, 800),
};

if (window.localStorage.getItem("settings")) {
  settings = {
    ...settings,
    ...JSON.parse(window.localStorage.getItem("settings")!),
  };
}

export function getAspectRatio() {
  return window.innerWidth / window.innerHeight;
}

export function getFov() {
  const hfov = 103;
  const vfov =
    2 *
    Math.atan(Math.tan((hfov * Math.PI) / 180 / 2) / getAspectRatio()) *
    (180 / Math.PI);
  return vfov;
}

export function getMouseSens() {
  return settings.mouseSensitivity;
}

//@ts-ignore
window["setSensitivy"] = (cmPer360: number, dpi = 800): void => {
  settings.mouseSensitivity = calculateSensitivityByCmPer360(cmPer360, dpi);
  window.dispatchEvent(new CustomEvent("mouse_sens"));

  window.localStorage.setItem("settings", JSON.stringify(settings));
};
