import {
  CapsuleGeometry,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Group,
  MeshBasicMaterial,
  PlaneGeometry,
  Object3D,
  Box3,
  EquirectangularReflectionMapping,
} from "three";
import { GameObject } from "./game-object";
import { Game } from "../game";
import { MATERIAL_IDS, MATERIALS } from "../asset-loader";

// const DEFAULT_MATERIAL = new MeshStandardMaterial({
//   // color: 0xfb4121,
//   color: 0x00ffc6,
//   roughness: 0.3,
// });

// const HP_BAR_BG_MATERIAL = new MeshBasicMaterial({
//   // color: 0x682727,
//   color: 0x3c7c6e,
// });

// const HP_BAR_FG_MATERIAL = new MeshBasicMaterial({
//   // color: 0xb03131,
//   color: 0x00ffc6,
// });

export class Target extends GameObject {
  private maxHP: number = 1;
  private hp: number = 1;
  private hpBar: Object3D | null = null;
  private fullHpBarScale: number = 0;

  private targetPos = new Vector3(0, 0, 0);
  private previousPos = new Vector3(0, 0, 0);
  private lerpAcc = 0;

  // private movementStrategy: MovementStrategy = MovementStrategy.STATIC;
  // private movementBoundingBox?: Box3;
  // private movementVelocity?: Vector3;
  // private movementDirection?: Vector3;
  // private changeDirectionChance?: number;
  // private changeDirectionCooldown?: number;
  // private lastChangeDirectionTimestamp = 0;

  constructor(game: Game) {
    const mesh = new Mesh(undefined, MATERIALS.get(MATERIAL_IDS.TARGET));
    super(game, mesh);
  }

  setup(
    radius: number,
    height: number,
    position: Vector3,
    maxHp: number,
    hp: number
  ) {
    const geometry = new CapsuleGeometry(radius, height, 8, 16);
    this.mesh.geometry = geometry;

    this.mesh.position.copy(position);

    // TODO: decouple physics tick from rendering, use interpolation
    // this.previousPos.copy(this.targetPos);
    // this.targetPos.copy(position);

    this.maxHP = maxHp;
    this.hp = hp;

    // add hp bar above target
    if (this.maxHP > 1) {
      const hpBar = new Group();

      this.fullHpBarScale = Math.max(radius * 2, 0.325);

      const hpBarGeo = new PlaneGeometry(this.fullHpBarScale, 0.06);
      const hpBarBg = new Mesh(hpBarGeo, MATERIALS.get(MATERIAL_IDS.HP_BAR_BG));
      hpBar.add(hpBarBg);

      const hpBarFg = new Mesh(hpBarGeo, MATERIALS.get(MATERIAL_IDS.HP_BAR_FG));
      hpBarFg.position.z = 0.001;
      hpBar.add(hpBarFg);

      hpBar.position.set(0, height / 2 + radius + 0.07, 0);

      this.mesh.add(hpBar);
      this.hpBar = hpBarFg;
      hpBar.lookAt(this.game.cameraPosition);
      hpBar.visible = false;
    }
  }

  update(position: Vector3, hp: number) {
    this.mesh.position.copy(position);
    this.hp = hp;
  }

  // TODO: decouple physics tick from rendering, use interpolation
  // update(position: Vector3, hp: number) {
  //   this.mesh.position.copy(this.targetPos);
  //   this.previousPos.copy(this.targetPos);
  //   this.targetPos.copy(position);
  //   this.hp = hp;
  //   this.lerpAcc = 0;
  // }

  // render(delta: number, physicsTickRate: number) {
  //   this.lerpAcc += delta;
  //   this.mesh.position.lerpVectors(
  //     this.previousPos,
  //     this.targetPos,
  //     Math.min(1.0, this.lerpAcc / physicsTickRate)
  //   );
  // }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.game.handlers?.handleDeath(this.id);
    this.game.addScore(this.maxHP);
    this.game.addTTK();
    this.game.removeTarget(this);
    this.game.audioHandler.playKill();
    super.destroy();
  }

  onHit() {
    if (this.maxHP === 0 && this.hp === 0) {
      // do nothing
      return;
    }

    if (this.hpBar) {
      const hpPercentage = this.hp / this.maxHP;
      this.hpBar.scale.set(hpPercentage, 1, 1);
      this.hpBar.position.x = -((this.fullHpBarScale / 2) * (1 - hpPercentage));
    }

    if (this.hp <= 0) {
      this.destroy();
    }
  }

  onTick(elapsedTime: number, delta: number) {
    // if (this.movementStrategy === MovementStrategy.LINEAR) {
    //   // do linear movement
    //   if (
    //     elapsedTime >
    //     this.lastChangeDirectionTimestamp + this.changeDirectionCooldown!
    //   ) {
    //     const change =
    //       Math.random() <=
    //       (this.changeDirectionChance! * delta) / this.changeDirectionCooldown!;
    //     if (change) {
    //       this.movementDirection!.multiplyScalar(-1);
    //       this.lastChangeDirectionTimestamp = elapsedTime;
    //     }
    //   }
    //   const scaledVel = this.movementVelocity!.clone()
    //     .multiply(this.movementDirection!)
    //     .multiplyScalar(delta);

    //   this.mesh.position.add(scaledVel);
    //   if (!this.movementBoundingBox?.containsPoint(this.mesh.position)) {
    //     // force direction change on hitting bounding box and reset cooldown as grace period
    //     this.movementDirection!.multiplyScalar(-1);
    //     this.lastChangeDirectionTimestamp = elapsedTime;
    //     this.movementBoundingBox?.clampPoint(
    //       this.mesh.position,
    //       this.mesh.position
    //     );
    //   }
    // }

    if (this.hpBar && this.hp < this.maxHP) {
      this.hpBar.parent!.visible = true;
      this.hpBar.parent!.lookAt(this.game.cameraPosition);
    }
  }
}
