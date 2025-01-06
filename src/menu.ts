export function toggleMenu(active: boolean) {
  document
    .querySelector(".main-menu")
    ?.classList.toggle("menu-hidden", !active);
}
