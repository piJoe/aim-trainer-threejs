import m from "mithril";
import { loadingState } from "src/ts/stores/loading";

import loadingStr from "assets/web/loading-v2-reverse.svg?raw";
const loadingSvg = m.trust(loadingStr);

export class LoadingIndicator implements m.ClassComponent {
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
    const loading = loadingState.get();
    return (
      <div
        class={[
          "absolute right-16 bottom-16 flex flex-row self-end items-center gap-5 text-white",
          loading.paused && "hidden",
        ].join(" ")}
      >
        <div class="flex flex-col text-right uppercase">
          <div class="text-2xl font-medium">{loading.title}</div>
          <div class="text-lg">{loading.description}</div>
        </div>
        <div
          class={["w-[74px]", ...(loading.paused ? ["anim-paused"] : [])].join(
            " "
          )}
        >
          {loadingSvg}
        </div>
      </div>
    );
  }
}
