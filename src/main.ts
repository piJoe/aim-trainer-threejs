import { AimControls } from "./aim-controls";
import { Crosshair } from "./crosshair";
import { Game } from "./game";
import {
  ACESFilmicToneMapping,
  Clock,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { AudioHandler } from "./audio";
import { runLuaScenario } from "./luaScenario";
import { loadAssets, TEXTURE_IDS, TEXTURES } from "./asset-loader";

const controls = new AimControls(document.body);
window.addEventListener("click", () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

const renderer = new WebGLRenderer();
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
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

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  overlayCamera.left = -window.innerWidth / 2;
  overlayCamera.right = window.innerWidth / 2;
  overlayCamera.top = window.innerHeight / 2;
  overlayCamera.bottom = -window.innerHeight / 2;
  overlayCamera.updateProjectionMatrix();
});

const audio = new AudioHandler();

(async () => {
  await loadAssets(renderer);

  const luaStr = await (await fetch("/examples/v2/gpt-pasu-track.lua")).text();

  const game = new Game(controls, audio);
  const luaCalls = game.getLuaCalls();
  const handlers = await runLuaScenario(luaCalls, luaStr);

  const { scene, camera } = await game.setup(handlers);
  scene.environment = TEXTURES.get(TEXTURE_IDS.ENV_AUTOSHOP)!;

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

  // hide loading screen
  document
    .querySelector(".loading-screen")
    ?.classList.toggle("loading-done", true);
})();
