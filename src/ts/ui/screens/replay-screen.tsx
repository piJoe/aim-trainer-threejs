import m from "mithril";
import { TEXTURES, TEXTURE_IDS } from "src/ts/asset-loader";
import { Game, ReplayEvent } from "src/ts/game";
import { renderInstance } from "src/ts/renderer";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { sleep } from "src/ts/utils/sleep";
import { Clock } from "three";

import testReplay from "src/../replay.json?raw";

export class ReplayScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  gameInstance?: Game;
  replay: ReplayEvent[] = [];
  isPlaying = false;

  async loadReplay(replayJson: string) {
    if (!renderInstance.controls || !renderInstance.renderer) {
      return;
    }

    this.replay = JSON.parse(replayJson);

    const game = new Game(renderInstance.controls);
    this.gameInstance = game;

    const replaySetupCommands: ReplayEvent[] = [];
    for (let i = 0; i < this.replay.length; i++) {
      const event = this.replay.at(0);
      if (event && event?.elapsedTime <= 0) {
        this.replay.shift();
        replaySetupCommands.push(event);
        continue;
      }
      break;
    }

    const handlers = {
      handleInit: () => {
        replaySetupCommands.forEach((e) => {
          game.performReplayEvent(e);
        });
      },
      // remaining handlers all do nothing, at least for now.
      handleTick: (elapsedTime: number, delta: number) => {},
      handleDeath: (targetId: number) => {},
      handleTargetHit: (targetId: number) => {},
    };

    const { scene, camera } = await game.setup(handlers);
    scene.environment = TEXTURES.get(TEXTURE_IDS.ENV_AUTOSHOP)!;

    const clock = new Clock();
    // TODO: decouple physics tick from rendering, use interpolation
    // let physicsTickAccumulator = 0;
    // const physicsTickRate = 1 / 60;
    let elapsedTime = 0;
    const render = () => {
      // const elapsedTime = clock.elapsedTime;
      const delta = clock.getDelta();
      if (!this.isPlaying) {
        return;
      }

      // need this manually because clock keeps running when game is paused :(
      elapsedTime += delta;

      // find events to perform
      for (let i = 0; i < this.replay.length; i++) {
        const event = this.replay.at(0);
        if (event && event?.elapsedTime <= elapsedTime) {
          this.replay.shift();
          game.performReplayEvent(event);
          continue;
        }
        break;
      }
      game.replayTick();

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
    };
    scene.updateMatrixWorld();
    renderInstance.renderer.setAnimationLoop(render);
  }

  async oninit(vnode: m.Vnode<UIScreenAttrs, this>) {
    await this.loadReplay(testReplay);
  }

  oncreate(vnode: m.VnodeDOM<UIScreenAttrs>): void {
    vnode.dom
      ?.querySelector("#game-canvas")
      ?.append(renderInstance.renderer!.domElement);

    // super.oncreate(vnode);

    this.isPlaying = true;
  }

  view() {
    return (
      <div>
        <div id="game-canvas"></div>
      </div>
    );
  }
}
