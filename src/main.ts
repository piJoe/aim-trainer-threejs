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
import { setLoadingText, toggleLoadingScreen } from "./loading";
import { setUserMouseSensitivity } from "./settings";

const controls = new AimControls(document.body);

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
  toggleLoadingScreen(true);
  await loadAssets(renderer);

  setLoadingText("LOADING SCENARIO", "GPT Tracking V2");
  const luaStr = await (await fetch("/examples/v2/gpt-tracking.lua")).text();

  async function setupScenario() {
    toggleLoadingScreen(true);
    setLoadingText("SETUP SCENARIO", "GPT Tracking V2");
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

    toggleLoadingScreen(false);
  }

  await setupScenario();

  document.getElementById("menu-continue")?.addEventListener("click", () => {
    controls.lock();
  });
  document
    .getElementById("menu-restart")
    ?.addEventListener("click", async () => {
      // TODO: TEST IF WE NEED TO RESET ANYTHING LIKE REMOVE GEOMETRY OR MATERIALS FROM GPU OR SOMETHING, IDK
      await setupScenario();
      controls.lock();
    });
  document.getElementById("menu-settings")?.addEventListener("click", () => {
    document.querySelector(".sens-setting")?.classList.toggle("hidden", false);
  });

  document.getElementById("close-setting")?.addEventListener("click", () => {
    document.querySelector(".sens-setting")?.classList.toggle("hidden", true);
  });
  document.getElementById("save-sensitivity")?.addEventListener("click", () => {
    const cmPer360 =
      (document.getElementById("setting-mouse-cmper360") as HTMLInputElement)
        .value ?? "30";
    const dpi =
      (document.getElementById("setting-mouse-dpi") as HTMLInputElement)
        .value ?? "800";

    setUserMouseSensitivity(parseFloat(cmPer360), parseInt(dpi));
  });
})();
