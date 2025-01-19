import m from "mithril";
import { LoadingIndicator } from "src/ts/ui/components/loading-indicator";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { loadingState } from "src/ts/stores/loading";
import { screenNavigate } from "src/ts/ui/ui";
import { audioHandler } from "src/ts/audio";

import logoStr from "assets/web/logo.svg?raw";
import { ChooseScreen } from "src/ts/ui/screens/choose-screen";
const logoSvg = m.trust(logoStr);

export class LoadingScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  cancelLoadingStateListen?: () => void;

  oninit(vnode: m.Vnode) {
    this.cancelLoadingStateListen = loadingState.listen(() => {
      m.redraw();
    });
  }

  onremove(vnode: m.VnodeDOM) {
    if (this.cancelLoadingStateListen) this.cancelLoadingStateListen();
  }

  view() {
    const { paused } = loadingState.get();

    return (
      <div
        class={[
          "h-full bg-purple-flash flex items-center justify-center flex-col gap-5 p-16",
          paused ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
        onclick={() => {
          if (!paused) return;
          audioHandler.setup();
          screenNavigate(ChooseScreen);
        }}
      >
        <div class="w-[50vw] max-h-[50vh] max-w-[600px] text-primary">
          {logoSvg}
        </div>
        <div
          class={[
            "text-3xl font-semibold italic text-white",
            paused ? "animate-pulse" : "opacity-0",
          ].join(" ")}
        >
          Click to start
        </div>
      </div>
    );
  }
}
