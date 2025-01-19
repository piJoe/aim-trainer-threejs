import m from "mithril";
import { subscribeKeys } from "nanostores";
import { Game } from "src/ts/game";
import { InGameScreen } from "src/ts/ui/screens/ingame/ingame-screen";

export interface IngameOverlayAttrs {
  ingameScreen: InGameScreen;
}
export class IngameOverlayScreen
  implements m.ClassComponent<IngameOverlayAttrs>
{
  private unsubscribeGameStore?: () => void;
  oninit(vnode: m.Vnode<IngameOverlayAttrs, this>) {
    if (!vnode.attrs.ingameScreen.gameInstance?.gameStore) {
      return;
    }

    this.unsubscribeGameStore = subscribeKeys(
      vnode.attrs.ingameScreen.gameInstance?.gameStore,
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
    const state = vnode.attrs.ingameScreen.gameInstance?.gameStore?.get();
    return (
      <div class="absolute w-full top-14 text-white flex flex-col items-center font-medium">
        <div class="text-xl">
          <span class="text-3xl font-semibold">{state?.score ?? 0}</span> pts
        </div>
        {(state?.timeLeft ?? -1) > -1 && (
          <div class="text-3xl">
            <span class="text-6xl font-semibold">{state?.timeLeft}</span>s
          </div>
        )}
      </div>
    );
  }
}
