import * as THREE from "three";

export class Crosshair {
  private group: THREE.Group;

  constructor(sizePx = 6, thicknessPx = 2) {
    const size = sizePx / window.devicePixelRatio;
    const thickness = thicknessPx / window.devicePixelRatio;

    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      depthTest: false,
    });

    const horizontalCrosshairGeometry = new THREE.PlaneGeometry(
      size * 2,
      thickness
    );
    const verticalCrosshairGeometry = new THREE.PlaneGeometry(
      thickness,
      size * 2
    );

    this.group = new THREE.Group();
    this.group.add(new THREE.Mesh(horizontalCrosshairGeometry, material));
    this.group.add(new THREE.Mesh(verticalCrosshairGeometry, material));
    this.group.position.set(0, 0, 0);
  }

  get object() {
    return this.group;
  }
}
