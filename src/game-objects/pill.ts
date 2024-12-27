import {
  CapsuleGeometry,
  MeshStandardMaterial,
  Mesh,
  CanvasTexture,
  Sprite,
  SpriteMaterial,
  Vector3,
  CatmullRomCurve3,
  MathUtils,
  Raycaster,
} from "three";
import { GameObject } from "./game-object";
import { Game } from "../game";

const DEFAULT_MATERIAL = new MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.35,
});

const HIT_MATERIAL = new MeshStandardMaterial({
  // color: 0x20ff2d,
  color: 0xffffff,
  roughness: 0.35,
});

export class Pill extends GameObject {
  private labelCtx: OffscreenCanvasRenderingContext2D;
  private labelTexture: CanvasTexture;

  private curveTime = 0.0;
  private hits: number[] = [];

  private curve = new CatmullRomCurve3([
    new Vector3(MathUtils.randFloat(1.2, 1.5), 0, 0),
    new Vector3(MathUtils.randFloat(0.5, 2), 0, 0),
    new Vector3(MathUtils.randFloat(1.5, 3.2), 0, 0),
    new Vector3(MathUtils.randFloat(0.5, 1.5), 0, 0),
    new Vector3(MathUtils.randFloat(0.8, 3.0), 0, 0),
    new Vector3(MathUtils.randFloat(3.0, 3.5), 0, 0),
  ]);
  private moveDirection = 1;
  private velocity = this.curve.getPointAt(0);

  constructor(
    game: Game,
    radius: number,
    height: number,
    startPosition: Vector3
  ) {
    const geometry = new CapsuleGeometry(radius, height, 8, 16);
    const mesh = new Mesh(geometry, DEFAULT_MATERIAL);

    const labelCanvas = new OffscreenCanvas(256, 64);
    const labelCtx = labelCanvas.getContext("2d")!;
    labelCtx.fillStyle = "white";
    labelCtx.font = "32px Arial";
    labelCtx.textAlign = "center";
    const labelTexture = new CanvasTexture(labelCanvas);
    const labelMat = new SpriteMaterial({
      map: labelTexture,
      depthTest: false,
    });
    const labelSprite = new Sprite(labelMat);
    labelSprite.scale.set(256 / 500, 64 / 500, 1);
    labelSprite.position.set(0, height * 0.5 + 64 / 500 + 0.05, 0);
    mesh.add(labelSprite);

    mesh.position.copy(startPosition);

    super(game, mesh);

    this.labelCtx = labelCtx;
    this.labelTexture = labelTexture;

    this.updateLabel();
  }

  update(elapsedTime: number, delta: number) {
    if (this.game.castRay(this.mesh)) {
      this.mesh.material = HIT_MATERIAL;
      this.hits.push(1);
    } else {
      this.mesh.material = DEFAULT_MATERIAL;
      this.hits.push(0);
    }
    const tenSeconds = this.game.averageFps * 10;
    if (this.hits.length > tenSeconds) {
      this.hits.splice(0, this.hits.length - tenSeconds);
    }

    this.curveTime = Math.max(
      0,
      Math.min(1, Math.sin(elapsedTime * 0.02) * 0.5 + 0.5)
    );
    this.curve.getPointAt(this.curveTime, this.velocity);

    this.mesh.position.addScaledVector(
      this.velocity,
      delta * this.moveDirection
    );

    if (this.mesh.position.x >= 3.9 || this.mesh.position.x <= -3.9) {
      this.mesh.position.x = Math.min(
        3.9,
        Math.max(-3.9, this.mesh.position.x)
      );
      this.moveDirection *= -1;
    }

    this.updateLabel();
  }

  updateLabel() {
    this.labelCtx!.clearRect(0, 0, 256, 64);
    this.labelCtx!.fillText(
      `Velocity: ${this.velocity.length().toFixed(2)}`,
      128,
      24
    );
    this.labelCtx!.fillText(
      `Hits: ${(
        (this.hits.reduce((total, i) => (total += i), 0) / this.hits.length) *
          100 || 0.0
      ).toFixed(2)}%`,
      128,
      60
    );
    this.labelTexture.needsUpdate = true;
  }
}
