import { AimControls } from "./aim-controls";
import { Crosshair } from "./crosshair";
import { Game } from "./game";
import { LuaFactory } from "wasmoon";
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { AudioHandler } from "./audio";

// lua imports (handled by esbuild)
import luaScenarioRuntime from "./lua/scenario-runtime.lua";
import { runLuaScenario } from "./luaScenario";

const scene = new Scene();
const hfov = 103;
const aspectRatio = window.innerWidth / window.innerHeight;
const vfov =
  2 *
  Math.atan(Math.tan((hfov * Math.PI) / 180 / 2) / aspectRatio) *
  (180 / Math.PI);

const controls = new AimControls(document.body);
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

const audio = new AudioHandler();

(async () => {
  const luaStr = await (await fetch("/examples/v2/gpt-pasu-like.lua")).text();

  const game = new Game(controls, audio);
  const luaCalls = game.getLuaCalls();
  const handlers = await runLuaScenario(luaCalls, luaStr);

  const { scene, camera } = await game.setup(handlers);

  const clock = new Clock();
  let firstFrame = true;
  function render() {
    const elapsedTime = clock.elapsedTime;
    const delta = clock.getDelta();
    if (!controls.isLocked && !firstFrame) {
      return;
    }

    game.onTick(elapsedTime, delta);

    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(overlayScene, overlayCamera);

    firstFrame = false;
  }
  scene.updateMatrixWorld();
  renderer.setAnimationLoop(render);
})();
