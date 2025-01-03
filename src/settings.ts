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
