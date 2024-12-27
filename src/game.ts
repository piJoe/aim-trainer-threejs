import {
  AmbientLight,
  Camera,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "three";
import { loadTexture } from "./texture";
import { Target } from "./game-objects/target";
import { AimControls, ClickEventType } from "./aim-controls";
import { AudioHandler } from "./audio";

interface GameConfig {
  roomSize: { x: number; y: number; z: number };
  cameraPos: { x: number; y: number; z: number };
  bulletsPerMinute?: number;
  timer: number;
}

export enum MovementStrategy {
  STATIC = "static",
  LINEAR = "linear",
  VELOCITY_CURVE = "velocity_curve",
  CUSTOM = "custom",
}

export interface TargetConfig {
  size: { radius: number; height: number };
  position: { x: number; y: number; z: number };
  hp: number;
  movement?: {
    strategy: MovementStrategy;
    boundingBox?: {
      min?: { x: number; y: number; z: number };
      max?: { x: number; y: number; z: number };
    };
    curve?: { x: number; y: number; z: number }[];
    curveUpdateSpeed?: number;
    velocity?: { x: number; y: number; z: number };
    changeDirectionChance?: number;
    changeDirectionCooldown?: number;
  };
  onDeath?: () => void;
}

export class Game {
  targets: Target[] = [];
  private targetsToAdd: Target[] = [];
  private targetsToRemove: Target[] = [];
  private fpsHistory: number[] = [];
  private avgFps = 0;
  private raycasterVector = new Vector2();

  private bulletsPerSecond = 0;
  private shotAccumulator = 0;
  private shooting = false;

  constructor(
    public camera: Camera,
    private raycastCam: Camera,
    private scene: Scene,
    private raycaster: Raycaster,
    private controls: AimControls,
    private audioHandler: AudioHandler
  ) {}

  async setup(gameConfig: GameConfig) {
    const floorTexture = await loadTexture(
      "assets/textures/dark/texture_04.png"
    );
    const wallTexture = await loadTexture(
      "assets/textures/dark/texture_13.png"
    );

    const wallMaterial = new MeshStandardMaterial({
      color: 0xdddddd,
      map: wallTexture,
    });
    const floorMaterial = new MeshStandardMaterial({
      color: 0x888888,
      map: floorTexture,
    });

    const createWall = (
      width: number,
      height: number,
      x: number,
      y: number,
      z: number,
      rotationX = 0,
      rotationY = 0,
      rotationZ = 0,
      isFloor = false
    ) => {
      const wall = new PlaneGeometry(width, height);
      wall.rotateX(rotationX);
      wall.rotateY(rotationY);
      wall.rotateZ(rotationZ);
      wall.translate(x, y, z);
      const uv = wall.getAttribute("uv").array;
      for (let i = 0; i < uv.length; i += 2) {
        uv[i] *= width;
        uv[i + 1] *= height;
      }
      return new Mesh(wall, isFloor ? floorMaterial : wallMaterial);
    };

    const roomSize = gameConfig.roomSize;
    const walls = [
      createWall(roomSize.x, roomSize.y, 0, 0, -roomSize.z / 2, 0), // front wall
      createWall(roomSize.x, roomSize.y, 0, 0, roomSize.z / 2, 0, Math.PI), // back wall
      createWall(roomSize.z, roomSize.y, -roomSize.x / 2, 0, 0, 0, Math.PI / 2), // left wall
      createWall(roomSize.z, roomSize.y, roomSize.x / 2, 0, 0, 0, -Math.PI / 2), // right wall
      createWall(
        roomSize.x,
        roomSize.z,
        0,
        -roomSize.y / 2,
        0,
        -Math.PI / 2,
        0,
        0,
        true
      ), // floor
      createWall(
        roomSize.x,
        roomSize.z,
        0,
        roomSize.y / 2,
        0,
        Math.PI / 2,
        0,
        0,
        true
      ), // roof
    ];

    walls.forEach((wall) => this.scene.add(wall));

    const light = new DirectionalLight(0xd8e5ff, 1);
    this.scene.add(light);

    const lightFront = new DirectionalLight(0xffffff, 0.6);
    lightFront.position.z = 50;
    lightFront.position.x = 30;
    this.scene.add(lightFront);

    const ambientLight = new AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    this.camera.position.set(
      gameConfig.cameraPos.x,
      gameConfig.cameraPos.y,
      gameConfig.cameraPos.z
    );

    this.bulletsPerSecond = (gameConfig.bulletsPerMinute ?? 0) / 60;
  }

  performShot() {
    const targetsHit = [];
    for (const target of this.targets) {
      const intersection = target.castRay(this.raycaster);
      if (intersection.length > 0) {
        targetsHit.push({
          distance: intersection[0].distance,
          target,
        });
      }
    }
    if (targetsHit.length > 0) {
      targetsHit.sort((a, b) => a.distance - b.distance);
      targetsHit[0].target.onHit();
      this.audioHandler.playHit();
    } else {
      this.audioHandler.playMiss();
    }
  }

  updateControlEvents(delta: number) {
    while (this.controls.hasClickEvents()) {
      const event = this.controls.nextClickEvent();
      if (event?.eventType === ClickEventType.RELEASE) {
        this.shooting = false;
      }
      if (event?.eventType === ClickEventType.CLICK) {
        this.shooting = true;
        this.shotAccumulator = 1 / this.bulletsPerSecond;
        if (this.bulletsPerSecond === 0) {
          this.raycastCam.position.copy(event.cameraPosition);
          this.raycastCam.quaternion.copy(event.cameraQuaternion);
          this.raycastCam.updateMatrixWorld();
          this.raycaster.setFromCamera(this.raycasterVector, this.raycastCam);
          this.performShot();
        }
      }
    }

    if (this.shooting) {
      this.shotAccumulator += delta;
      while (this.shotAccumulator >= 1 / this.bulletsPerSecond) {
        this.shotAccumulator -= 1 / this.bulletsPerSecond;
        this.raycastCam.position.copy(this.camera.position);
        this.raycastCam.quaternion.copy(this.camera.quaternion);
        this.raycastCam.updateMatrixWorld();
        this.raycaster.setFromCamera(this.raycasterVector, this.raycastCam);
        this.performShot();
      }
    }
  }

  update(elapsedTime: number, delta: number) {
    this.updateAverageFps(delta);

    this.updateControlEvents(delta);

    for (const target of this.targets) {
      target.update(elapsedTime, delta);
    }

    this.targets = this.targets.filter((object) => {
      return !this.targetsToRemove.includes(object);
    });
    this.targetsToRemove = [];

    for (const object of this.targetsToAdd) {
      object.addObjectToParent(this.scene);
      this.targets.push(object);
    }
    this.targetsToAdd = [];
  }

  spawnTarget(targetConfig: TargetConfig) {
    const target = new Target(
      this,
      targetConfig.size.radius,
      targetConfig.size.height,
      new Vector3(
        targetConfig.position.x,
        targetConfig.position.y,
        targetConfig.position.z
      ),
      targetConfig.hp,
      targetConfig.onDeath
    );
    if (targetConfig.movement?.strategy) {
      target.setMovementStrategy(targetConfig.movement);
    }
    this.add(target);
  }

  add(target: Target) {
    this.targetsToAdd.push(target);
  }

  remove(target: Target) {
    this.targetsToRemove.push(target);
    target.removeObjectFromParent(this.scene);
  }

  updateAverageFps(delta: number) {
    const fps = 1 / delta;
    if (fps > 0 && fps < Number.POSITIVE_INFINITY) {
      this.fpsHistory.push(1 / delta);
    }
    if (this.fpsHistory.length > 300) {
      this.fpsHistory.shift();
    }

    this.avgFps =
      this.fpsHistory.reduce((total, i) => (total += i), 0) /
      this.fpsHistory.length;
  }

  get averageFps() {
    return this.avgFps;
  }
}
