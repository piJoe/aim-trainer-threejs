import { AimControls } from "./aim-controls";
import { Crosshair } from "./crosshair";
import { Pill } from "./game-objects/pill";
import { Game } from "./game";
import { LuaFactory } from "wasmoon";
import { calculateSensitivityByCmPer360 } from "./maths/sensitivity";
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { AudioHandler } from "./audio";

const scene = new Scene();
const hfov = 103;
const aspectRatio = window.innerWidth / window.innerHeight;
const vfov =
  2 *
  Math.atan(Math.tan((hfov * Math.PI) / 180 / 2) / aspectRatio) *
  (180 / Math.PI);

const camera = new PerspectiveCamera(vfov, aspectRatio, 0.1, 1000);
camera.position.z = 1.5;

const raycastCam = camera.clone();

const controls = new AimControls(camera, document.body);
window.addEventListener("click", () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

const renderer = new WebGLRenderer();
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const overlayCamera = new OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  1,
  10
);
overlayCamera.position.z = 1;
const overlayScene = new Scene();
const crosshair = new Crosshair(6, 2);
overlayScene.add(crosshair.object);

const audio = new AudioHandler(camera);

async function testLuaScript() {
  const factory = new LuaFactory("/.build/glue.wasm");
  const lua = await factory.createEngine();
  try {
    lua.global.set("spawnTarget", ({ ...opts }) => {
      console.log("spawnTarget", opts);
    });

    const luaStr = await (await fetch("/examples/tracking-simple.lua")).text();

    const script = await lua.doString(luaStr);
    const config = script.setup();

    // setup game based on config received from lua script
    const game = new Game(
      camera,
      raycastCam,
      scene,
      new Raycaster(),
      controls,
      audio
    );
    await game.setup(config);

    lua.global.set("spawnTarget", ({ ...opts }) => {
      game.spawnTarget(opts as any);
    });
    script.onInit();

    const clock = new Clock();
    let firstFrame = true;
    function render() {
      const elapsedTime = clock.elapsedTime;
      const delta = clock.getDelta();
      if (!controls.isLocked && !firstFrame) {
        return;
      }

      game.update(elapsedTime, delta);

      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCamera);

      firstFrame = false;
    }
    scene.updateMatrixWorld();
    renderer.setAnimationLoop(render);
  } finally {
    // lua.global.close();
  }
}
testLuaScript();
