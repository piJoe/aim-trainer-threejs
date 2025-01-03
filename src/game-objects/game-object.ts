import { Mesh, Object3D, Raycaster } from "three";
import { Game } from "../game";
let objectIdCounter = 0;

export abstract class GameObject {
  public id = objectIdCounter++;
  protected mesh: Mesh;
  protected isDestroyed = false;

  constructor(protected game: Game, mesh: Mesh) {
    this.mesh = mesh;
  }

  public destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this.mesh.geometry.dispose();
  }

  public onTick(elapseTime: number, delta: number) {}

  public addObjectToParent(parent: Object3D) {
    parent.add(this.mesh);
  }

  public removeObjectFromParent(parent: Object3D) {
    parent.remove(this.mesh);
  }

  public castRay(raycaster: Raycaster) {
    return raycaster.intersectObject(this.mesh, false);
  }
}
