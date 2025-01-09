import { AimControls } from "./aim-controls";
import { Crosshair } from "./crosshair";
import { Game } from "./game";
import {
  ACESFilmicToneMapping,
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { AudioHandler } from "./audio";
import { runLuaScenario } from "./luaScenario";
import {
  loadAssets,
  MATERIAL_IDS,
  MATERIALS,
  TEXTURE_IDS,
  TEXTURES,
} from "./asset-loader";
import { setLoadingText, toggleLoadingScreen } from "./loading";
import { setUserMouseSensitivity } from "./settings";
import m from "mithril";

import { OtherScreen } from "src/ts/ui/screens/other-screen";
import { mainUI, setActiveScreen } from "src/ts/ui/ui";

const controls = new AimControls(document.body);

// setup webgl renderer
const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas") as HTMLCanvasElement,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;

// setup ui overlay
m.mount(document.getElementById("ui")!, mainUI);

window.setTimeout(() => {
  setActiveScreen(OtherScreen);
}, 2500);

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
  const luaStr = await (await fetch("/scenarios/v2/gpt-tracking.lua")).text();

  async function setupScenario() {
    toggleLoadingScreen(true);
    setLoadingText("SETUP SCENARIO", "GPT Tracking V2");
    const game = new Game(controls, audio);
    const luaCalls = game.getLuaCalls();
    const handlers = await runLuaScenario(luaCalls, luaStr);

    const { scene, camera } = await game.setup(handlers);
    scene.environment = TEXTURES.get(TEXTURE_IDS.ENV_AUTOSHOP)!;

    const clock = new Clock();
    // TODO: decouple physics tick from rendering, use interpolation
    // let physicsTickAccumulator = 0;
    // const physicsTickRate = 1 / 60;
    let firstFrame = true;
    let elapsedTime = 0;
    function render() {
      // const elapsedTime = clock.elapsedTime;
      const delta = clock.getDelta();
      if (!controls.isLocked && !firstFrame) {
        return;
      }

      // need this manually because clock keeps running when game is paused :(
      elapsedTime += delta;

      game.onTick(elapsedTime, delta);

      // TODO: decouple physics tick from rendering, use interpolation
      // physicsTickAccumulator += delta;
      // while (physicsTickAccumulator > physicsTickRate) {
      //   physicsTickAccumulator -= physicsTickRate;
      //   game.onTick(elapsedTime, physicsTickRate);
      // }
      // game.render(delta, physicsTickRate);

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

  async function test() {
    toggleLoadingScreen(false);

    const game = new Game(controls, audio);
    const { scene, camera } = await game.setup({ handleInit: () => {} } as any);
    scene.environment = TEXTURES.get(TEXTURE_IDS.ENV_AUTOSHOP)!;

    // const plane = new CapsuleGeometry(0.08, 0.05, 4, 10);
    // const edges = new EdgesGeometry(plane, 1);
    // const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(edges);
    // const lines = new LineSegments2(
    //   lineGeo,
    //   new LineMaterial({
    //     color: 0xff00ff,
    //     linewidth: 1,
    //   })
    // );
    // lines.position.z = 1.5;

    const plane = new PlaneGeometry(0.85, 0.43);
    const planeM = new Mesh(plane, MATERIALS.get(MATERIAL_IDS.TARGET));
    scene.add(planeM);

    // scene.add(lines);

    function render() {
      // const elapsedTime = clock.elapsedTime;
      if (!controls.isLocked) {
        return;
      }

      planeM.rotateOnAxis(new Vector3(0, 1, 0), 0.01);
      planeM.rotateOnAxis(new Vector3(0, 0, 1), Math.random() * 0.01);

      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCamera);
    }
    scene.updateMatrixWorld();
    renderer.setAnimationLoop(render);
  }
  // await test();

  document.getElementById("menu-continue")?.addEventListener("click", () => {
    controls.lock();
  });
  document
    .getElementById("menu-restart")
    ?.addEventListener("click", async () => {
      // TODO: TEST IF WE NEED TO RESET ANYTHING LIKE REMOVE GEOMETRY OR MATERIALS FROM GPU OR SOMETHING, IDK
      // we at least need to cleanup some event handlers inside game.ts!
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
