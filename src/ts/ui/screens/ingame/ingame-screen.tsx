import m from "mithril";
import { TEXTURE_IDS, TEXTURES } from "src/ts/asset-loader";
import { Game } from "src/ts/game";
import { runLuaScenario } from "src/ts/luaScenario";
import { renderInstance } from "src/ts/renderer";
import { setLoadingNoText, setLoadingPaused } from "src/ts/stores/loading";
import { FinalScoreScreen } from "src/ts/ui/screens/ingame/final-score-screen";
import { IngameOverlayScreen } from "src/ts/ui/screens/ingame/ingame-overlay-screen";
import { PauseMenuScreen } from "src/ts/ui/screens/ingame/pause-menu-screen";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { Clock } from "three";

export interface InGameScreenAttrs extends UIScreenAttrs {
  scenarioUrl?: string;
  scenarioTitle?: string;
}
export class InGameScreen
  extends UIScreen
  implements m.ClassComponent<InGameScreenAttrs>
{
  scenarioTitle?: string;

  private luaStr = "";
  gameInstance?: Game;

  async setupScenario() {
    if (!renderInstance.controls || !renderInstance.renderer) {
      return;
    }

    setLoadingNoText();
    const game = new Game(renderInstance.controls);
    this.gameInstance = game;

    const luaCalls = game.getLuaCalls();
    const handlers = await runLuaScenario(luaCalls, this.luaStr);

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
      if (!renderInstance.controls!.isLocked && !firstFrame) {
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

      renderInstance.renderer!.clear();
      renderInstance.renderer!.render(scene, camera);
      renderInstance.renderer!.clearDepth();
      renderInstance.renderer!.render(
        renderInstance.overlayScene!,
        renderInstance.overlayCamera!
      );

      firstFrame = false;
    }
    scene.updateMatrixWorld();
    renderInstance.renderer.setAnimationLoop(render);

    setLoadingPaused(true);
  }
  async oninit(vnode: m.Vnode<InGameScreenAttrs, this>) {
    this.scenarioTitle = vnode.attrs.scenarioTitle;

    setLoadingNoText();
  }

  async oncreate(vnode: m.VnodeDOM<InGameScreenAttrs, this>): Promise<void> {
    if (!vnode.attrs.scenarioUrl) {
      return;
    }

    setLoadingNoText();
    this.luaStr = await (await fetch(vnode.attrs.scenarioUrl)).text();
    await this.setupScenario();
    setLoadingPaused(true);

    vnode.dom
      ?.querySelector("#game-canvas")
      ?.append(renderInstance.renderer!.domElement);

    super.oncreate(vnode);
  }

  view() {
    return (
      <div>
        <div id="game-canvas"></div>
        {renderInstance.controls?.isLocked ? (
          <IngameOverlayScreen ingameScreen={this} />
        ) : this.gameInstance?.hasEnded ? (
          <FinalScoreScreen ingameScreen={this} />
        ) : (
          <PauseMenuScreen ingame={this} />
        )}
      </div>
    );
  }
}
