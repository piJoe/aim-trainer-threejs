import { calculateSensitivityByCmPer360 } from "./maths/sensitivity";

let settings = {
  mouse: {
    cmPer360: 35,
    dpi: 800,
    sensitivity: calculateSensitivityByCmPer360(35, 800),
  },
};

if (window.localStorage.getItem("settings")) {
  settings = {
    ...settings,
    ...JSON.parse(window.localStorage.getItem("settings")!),
  };
}

function updateUI() {
  document
    .getElementById("setting-mouse-cmper360")
    ?.setAttribute("value", settings.mouse.cmPer360 + "");
  document
    .getElementById("setting-mouse-dpi")
    ?.setAttribute("value", settings.mouse.dpi + "");
  document.getElementById("setting-mouse-sens")!.textContent = (
    settings.mouse.sensitivity * 10_000
  ).toFixed(4);
}

updateUI();

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
  return settings.mouse.sensitivity;
}

export function setUserMouseSensitivity(cmPer360: number, dpi = 800) {
  console.log(cmPer360, dpi);
  settings.mouse.cmPer360 = cmPer360;
  settings.mouse.dpi = dpi;
  settings.mouse.sensitivity = calculateSensitivityByCmPer360(cmPer360, dpi);
  window.dispatchEvent(new CustomEvent("mouse_sens"));

  window.localStorage.setItem("settings", JSON.stringify(settings));
  updateUI();
}
