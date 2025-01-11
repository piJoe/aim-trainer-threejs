import { AimControls } from "src/ts/aim-controls";
import { loadAssets } from "src/ts/asset-loader";
import { Crosshair } from "src/ts/crosshair";
import { setLoadingPaused } from "src/ts/stores/loading";
import {
  WebGLRenderer,
  ACESFilmicToneMapping,
  OrthographicCamera,
  Scene,
  Camera,
} from "three";

export const renderInstance: {
  renderer?: WebGLRenderer;
  controls?: AimControls;
  overlayScene?: Scene;
  overlayCamera?: Camera;
} = {};

export async function setupRenderer() {
  renderInstance.controls = new AimControls(document.body);

  // setup webgl renderer
  renderInstance.renderer = new WebGLRenderer({
    //   canvas: document.querySelector("canvas") as HTMLCanvasElement,
  });
  renderInstance.renderer.autoClear = false;
  renderInstance.renderer.setSize(window.innerWidth, window.innerHeight);
  renderInstance.renderer.toneMapping = ACESFilmicToneMapping;

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

  renderInstance.overlayCamera = overlayCamera;
  renderInstance.overlayScene = overlayScene;

  window.addEventListener("resize", () => {
    renderInstance.renderer!.setSize(window.innerWidth, window.innerHeight);

    overlayCamera.left = -window.innerWidth / 2;
    overlayCamera.right = window.innerWidth / 2;
    overlayCamera.top = window.innerHeight / 2;
    overlayCamera.bottom = -window.innerHeight / 2;
    overlayCamera.updateProjectionMatrix();
  });

  await loadAssets(renderInstance.renderer);
  setLoadingPaused(true);
}
