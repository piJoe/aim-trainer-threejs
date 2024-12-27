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
} from "three";
import { GameObject } from "./game-object";
import { Game, MovementStrategy, TargetConfig } from "../game";

const DEFAULT_MATERIAL = new MeshStandardMaterial({
  color: 0xfb4121,
  roughness: 0.4,
});

const HP_BAR_BG_MATERIAL = new MeshBasicMaterial({
  color: 0x682727,
});

const HP_BAR_FG_MATERIAL = new MeshBasicMaterial({
  color: 0xb03131,
});

export class Target extends GameObject {
  private hp = this.maxHP;
  private hpBar: Object3D | null = null;
  private fullHpBarScale: number = 0;

  private movementStrategy: MovementStrategy = MovementStrategy.STATIC;
  private movementBoundingBox?: Box3;
  private movementVelocity?: Vector3;
  private movementDirection?: Vector3;
  private changeDirectionChance?: number;
  private changeDirectionCooldown?: number;
  private lastChangeDirectionTimestamp = 0;

  constructor(
    game: Game,
    radius: number,
    height: number,
    startPosition: Vector3,
    private maxHP: number,
    private onDeath?: () => void
  ) {
    const geometry = new CapsuleGeometry(radius, height, 8, 16);
    const mesh = new Mesh(geometry, DEFAULT_MATERIAL);

    mesh.position.copy(startPosition);

    super(game, mesh);

    // add hp bar above target
    if (this.maxHP > 1) {
      const hpBar = new Group();

      this.fullHpBarScale = radius * 2;

      const hpBarGeo = new PlaneGeometry(this.fullHpBarScale, 0.025);
      const hpBarBg = new Mesh(hpBarGeo, HP_BAR_BG_MATERIAL);
      hpBar.add(hpBarBg);

      const hpBarFg = new Mesh(hpBarGeo, HP_BAR_FG_MATERIAL);
      hpBarFg.position.z = 0.001;
      hpBar.add(hpBarFg);

      hpBar.position.set(0, height / 2 + radius + 0.05, 0);

      this.mesh.add(hpBar);
      this.hpBar = hpBarFg;
      hpBar.lookAt(this.game.camera.position);
      hpBar.visible = false;
    }
  }

  setMovementStrategy(movement: TargetConfig["movement"]) {
    if (movement?.strategy === MovementStrategy.LINEAR) {
      this.movementStrategy = MovementStrategy.LINEAR;
      this.movementBoundingBox = new Box3(
        new Vector3(
          movement.boundingBox?.min?.x,
          movement.boundingBox?.min?.y,
          movement.boundingBox?.min?.z
        ),
        new Vector3(
          movement.boundingBox?.max?.x,
          movement.boundingBox?.max?.y,
          movement.boundingBox?.max?.z
        )
      );
      this.movementVelocity = new Vector3(
        movement.velocity?.x,
        movement.velocity?.y,
        movement.velocity?.z
      );
      this.movementDirection = new Vector3(
        Math.random() > 0.5 ? -1 : 1,
        Math.random() > 0.5 ? -1 : 1,
        Math.random() > 0.5 ? -1 : 1
      );
      this.changeDirectionChance = movement.changeDirectionChance ?? 0.5;
      this.changeDirectionCooldown = movement.changeDirectionCooldown ?? 1;
    }
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    if (this.onDeath) this.onDeath();
    this.game.remove(this);
    super.destroy();
  }

  onHit() {
    if (this.maxHP === 0 || this.hp === 0) {
      // do nothing
      return;
    }

    this.hp--;
    if (this.hpBar) {
      const hpPercentage = this.hp / this.maxHP;
      this.hpBar.scale.set(hpPercentage, 1, 1);
      this.hpBar.position.x = -((this.fullHpBarScale / 2) * (1 - hpPercentage));
    }

    if (this.hp <= 0) {
      this.destroy();
    }
  }

  update(elapsedTime: number, delta: number) {
    if (this.movementStrategy === MovementStrategy.LINEAR) {
      // do linear movement
      if (
        elapsedTime >
        this.lastChangeDirectionTimestamp + this.changeDirectionCooldown!
      ) {
        const change =
          Math.random() <=
          (this.changeDirectionChance! * delta) / this.changeDirectionCooldown!;
        if (change) {
          this.movementDirection!.multiplyScalar(-1);
          this.lastChangeDirectionTimestamp = elapsedTime;
        }
      }
      const scaledVel = this.movementVelocity!.clone()
        .multiply(this.movementDirection!)
        .multiplyScalar(delta);

      this.mesh.position.add(scaledVel);
      if (!this.movementBoundingBox?.containsPoint(this.mesh.position)) {
        // force direction change on hitting bounding box and reset cooldown as grace period
        this.movementDirection!.multiplyScalar(-1);
        this.lastChangeDirectionTimestamp = elapsedTime;
        this.movementBoundingBox?.clampPoint(
          this.mesh.position,
          this.mesh.position
        );
      }
    }

    if (this.hpBar && this.hp < this.maxHP) {
      this.hpBar.parent!.visible = true;
      this.hpBar.parent!.lookAt(this.game.camera.position);
    }
  }
}
