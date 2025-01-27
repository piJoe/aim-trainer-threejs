import m from "mithril";
import {
  AmbientLight,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "three";
import { Target } from "./game-objects/target";
import { AimControls, ClickEventType } from "./aim-controls";
import { getFov } from "./settings";
import { getAspectRatio } from "./utils/aspect-ratio";
import { LuaHandlers } from "./luaScenario";
import { MATERIAL_IDS, MATERIALS } from "./asset-loader";
import { audioHandler } from "src/ts/audio";
import { map } from "nanostores";
import { DeathReason } from "src/ts/game-objects/game-object";

interface GameStore {
  score: number;
  avgTTK: number;
  totalShots: number;
  shotsHit: number;
  timeLeft: number;
}

interface GameConfig {
  roomSize: { x: number; y: number; z: number };
  cameraPos: { x: number; y: number; z: number };
  bulletsPerMinute?: number;
  timer: number;
}

export class Game {
  private scene = new Scene();
  private camera = new PerspectiveCamera(getFov(), getAspectRatio(), 0.1, 1000);
  private raycastCam = this.camera.clone();
  private raycaster = new Raycaster();

  public audioHandler = audioHandler;

  // private shotRenderer = new WebGLRenderer();

  private gameConfig: GameConfig = {
    roomSize: { x: 8, y: 4, z: 6 },
    cameraPos: { x: 0, y: 0, z: 2 },
    bulletsPerMinute: 0,
    timer: 0,
  };

  public handlers?: LuaHandlers;

  // targets: Target[] = [];
  targets: Map<number, Target> = new Map();
  private targetsToAdd: Target[] = [];
  private targetsToRemove: Target[] = [];
  private fpsHistory: number[] = [];
  private avgFps = 0;
  private raycasterVector = new Vector2();

  private bulletsPerSecond = 0;
  private shotAccumulator = 0;
  private shooting = false;

  private elapsedTime = 0;
  private timer = 0;

  private lastKillTimestamp = 0;
  private ttkList: number[] = [];
  private totalShots = 0;
  private shotsHit = 0;

  public gameStore = map<GameStore>({
    score: 0,
    avgTTK: 0,
    totalShots: 0,
    shotsHit: 0,
    timeLeft: -1,
  });

  constructor(private controls: AimControls) {
    this.controls.setCamera(this.camera);
  }

  getLuaCalls() {
    return {
      createTarget: this.createTarget.bind(this),
      setupTarget: this.setupTarget.bind(this),
      updateTarget: this.updateTarget.bind(this),
      despawnTarget: this.despawnTarget.bind(this),
      addScore: this.addScore.bind(this),
      setRoomSize: this.setRoomSize.bind(this),
      setCameraPosition: this.setCameraPosition.bind(this),
      setWeaponRPM: this.setWeaponRPM.bind(this),
      setTimer: this.setTimer.bind(this),
    };
  }

  setRoomSize(width: number, length: number, height: number) {
    this.gameConfig.roomSize.x = width;
    this.gameConfig.roomSize.y = height;
    this.gameConfig.roomSize.z = length;
  }

  setCameraPosition(x: number, y: number, z: number) {
    this.gameConfig.cameraPos.x = x;
    this.gameConfig.cameraPos.y = y;
    this.gameConfig.cameraPos.z = z;
  }

  setWeaponRPM(rpm: number) {
    this.gameConfig.bulletsPerMinute = rpm;
  }

  setTimer(seconds: number) {
    this.gameConfig.timer = seconds;
  }

  async setup(handlers: LuaHandlers) {
    this.handlers = handlers;
    this.handlers.handleInit();

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
      return new Mesh(
        wall,
        isFloor
          ? MATERIALS.get(MATERIAL_IDS.FLOOR)
          : MATERIALS.get(MATERIAL_IDS.WALL)
      );
    };

    const roomSize = this.gameConfig.roomSize;
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

    // const light = new DirectionalLight(0xd8e5ff, 1);
    // this.scene.add(light);

    // const lightFront = new DirectionalLight(0xffffff, 0.6);
    // lightFront.position.z = 50;
    // lightFront.position.x = 30;
    // this.scene.add(lightFront);

    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.camera.position.set(
      this.gameConfig.cameraPos.x,
      this.gameConfig.cameraPos.y,
      this.gameConfig.cameraPos.z
    );

    this.bulletsPerSecond = (this.gameConfig.bulletsPerMinute ?? 0) / 60;

    this.timer = this.gameConfig.timer ?? 0;
    // document
    //   .getElementById("game-timer")!
    //   .classList.toggle("hidden", !(this.gameConfig.timer > 0));
    this.updateTimer(0);

    // TODO: unregister when game scenario done
    window.addEventListener("resize", () => {
      this.camera.aspect = getAspectRatio();
      this.camera.fov = getFov();
      this.raycastCam.copy(this.camera);
      this.camera.updateProjectionMatrix();
      this.raycastCam.updateProjectionMatrix();
    });

    return { scene: this.scene, camera: this.camera };
  }

  performShot() {
    const targetsHit = [];
    for (const target of this.targets.values()) {
      const intersection = target.castRay(this.raycaster);
      if (intersection.length > 0) {
        targetsHit.push({
          distance: intersection[0].distance,
          target,
        });
      }
    }
    if (targetsHit.length > 0) {
      // sort by distance, nearest to camera should be shot
      targetsHit.sort((a, b) => a.distance - b.distance);
      const target = targetsHit[0].target;

      // handle onhit in lua, then in the base target
      this.handlers?.handleTargetHit(target.id);
      target.onHit();
      this.shotsHit++;
      this.gameStore.setKey("shotsHit", this.shotsHit);
      audioHandler.playHit();
    } else {
      audioHandler.playMiss();
    }
    this.totalShots++;
    this.gameStore.setKey("totalShots", this.totalShots);
  }

  updateControlEvents(delta: number) {
    while (this.controls.hasClickEvents()) {
      const event = this.controls.nextClickEvent();
      if (event?.eventType === ClickEventType.RELEASE) {
        this.shooting = false;
      }
      if (event?.eventType === ClickEventType.CLICK) {
        this.shotAccumulator = 1 / this.bulletsPerSecond;
        if (this.bulletsPerSecond > 0) {
          this.shooting = true;
        }
        if (this.bulletsPerSecond === 0) {
          this.raycastCam.position.copy(event.cameraPosition);
          this.raycastCam.quaternion.copy(event.cameraQuaternion);
          this.raycastCam.updateMatrixWorld();
          this.raycaster.setFromCamera(this.raycasterVector, this.raycastCam);

          // // test make "screenshot" of hit from raycast cam
          // this.shotRenderer.setSize(1920, 1920 / getAspectRatio());
          // this.shotRenderer.render(this.scene, this.raycastCam);
          // console.log(this.shotRenderer.domElement.toDataURL("img/png"));

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

  updateTimer(elapsedTime: number) {
    // if (this.timer <= 0) return;
    if (this.hasEnded) return;

    this.elapsedTime = elapsedTime;
    // game is done, unlock controls -> activate the final score screen
    if (this.elapsedTime >= this.timer) {
      this.gameStore.setKey(
        "avgTTK",
        Math.round(
          (this.ttkList.reduce((t, ttk) => (t += ttk), 0) /
            this.ttkList.length) *
            100
        ) / 100 || 0
      );
      this.controls.unlock();
      m.redraw();
    }

    this.gameStore.setKey(
      "timeLeft",
      Math.floor(this.timer - this.elapsedTime)
    );
  }

  get hasEnded() {
    return this.timer > 0 && this.elapsedTime >= this.timer;
  }

  onTick(elapsedTime: number, delta: number) {
    this.updateAverageFps(delta);

    this.updateTimer(elapsedTime);
    this.updateControlEvents(delta);

    // first: handle every target inside lua
    this.handlers?.handleTick(elapsedTime, delta);

    // then handle base onTick implementation
    for (const target of this.targets.values()) {
      target.onTick(elapsedTime, delta);
    }

    for (const target of this.targetsToAdd) {
      target.addObjectToParent(this.scene);
      this.targets.set(target.id, target);
    }
    this.targetsToAdd = [];

    this.targetsToRemove.forEach((target) => {
      this.targets.delete(target.id);
      target.removeObjectFromParent(this.scene);
    });
    this.targetsToRemove = [];
  }

  // TODO: decouple physics tick from rendering, use interpolation
  // render(delta: number, physicsTickRate: number) {
  //   for (const target of this.targets.values()) {
  //     target.render(delta, physicsTickRate);
  //   }
  // }

  createTarget(): number {
    const target = new Target(this);
    this.addTarget(target);
    return target.id;
  }

  setupTarget(
    targetId: number,
    radius: number,
    height: number,
    posX: number,
    posY: number,
    posZ: number,
    maxHp: number,
    hp: number
  ) {
    const target = this.findTargetById(targetId);
    if (!target) {
      console.error("somehow target does not exist");
      return;
    }

    target.setup(radius, height, new Vector3(posX, posY, posZ), maxHp, hp);
  }

  updateTarget(
    targetId: number,
    posX: number,
    posY: number,
    posZ: number,
    hp: number
  ) {
    const target = this.findTargetById(targetId);
    if (!target) {
      console.error("somehow target does not exist");
      return;
    }

    target.update(new Vector3(posX, posY, posZ), hp);
  }

  despawnTarget(targetId: number) {
    const target = this.findTargetById(targetId);
    if (!target) {
      console.error("somehow target does not exist");
      return;
    }

    target.destroy(DeathReason.DESPAWN);
  }

  addTarget(target: Target) {
    this.targetsToAdd.push(target);
  }

  removeTarget(target: Target) {
    this.targetsToRemove.push(target);
  }

  addScore(points: number) {
    this.gameStore.setKey("score", this.gameStore.get().score + points);
  }

  addTTK() {
    const time = this.elapsedTime - this.lastKillTimestamp;
    this.lastKillTimestamp = this.elapsedTime;

    this.ttkList.push(time);
  }

  findTargetById(targetId: number) {
    return (
      this.targets.get(targetId) ??
      this.targetsToAdd.find((t) => t.id === targetId)
    );
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

    // document.getElementById("fps-counter")!.innerHTML = `${this.avgFps.toFixed(
    //   2
    // )} FPS`;
  }

  get cameraPosition() {
    return this.camera.position;
  }

  get averageFps() {
    return this.avgFps;
  }

  get hasStarted() {
    return this.elapsedTime > 0;
  }
}
