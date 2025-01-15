import m from "mithril";
import { subscribeKeys } from "nanostores";
import { Game } from "src/ts/game";

export interface IngameOverlayAttrs {
  game: Game;
}
export class IngameOverlayScreen
  implements m.ClassComponent<IngameOverlayAttrs>
{
  private unsubscribeGameStore?: () => void;
  oninit(vnode: m.Vnode<IngameOverlayAttrs, this>) {
    this.unsubscribeGameStore = subscribeKeys(
      vnode.attrs.game.gameStore,
      ["score", "timeLeft"],
      () => {
        m.redraw();
      }
    );
  }
  onremove(vnode: m.VnodeDOM<IngameOverlayAttrs, this>) {
    this.unsubscribeGameStore?.();
  }
  view(vnode: m.Vnode<IngameOverlayAttrs>) {
    const state = vnode.attrs.game.gameStore.get();
    return (
      <div class="absolute w-full top-14 text-white flex flex-col items-center font-medium">
        <div class="text-xl">
          <span class="text-3xl font-semibold">{state.score ?? 0}</span> pts
        </div>
        {state.timeLeft > -1 && (
          <div class="text-3xl">
            <span class="text-6xl font-semibold">{state.timeLeft}</span>s
          </div>
        )}
      </div>
    );
  }
}
