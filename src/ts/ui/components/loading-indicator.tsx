import m from "mithril";

import loadingStr from "assets/web/loading-v2-reverse.svg?raw";
const loadingSvg = m.trust(loadingStr);

interface Attrs {
  loadingTitle: string;
  loadingDesc?: string;
  paused?: boolean;
}

export class LoadingIndicator implements m.ClassComponent<Attrs> {
  view({ attrs }: m.Vnode<Attrs>) {
    return (
      <div class="absolute right-16 bottom-16 flex flex-row self-end items-center gap-5 text-white">
        <div class="flex flex-col text-right uppercase">
          <div class="text-2xl">{attrs.loadingTitle}</div>
          <div class="text-lg">{attrs.loadingDesc ?? ""}</div>
        </div>
        <div
          class={["w-[74px]", ...(attrs.paused ? ["anim-paused"] : [])].join(
            " "
          )}
        >
          {loadingSvg}
        </div>
      </div>
    );
  }
}
