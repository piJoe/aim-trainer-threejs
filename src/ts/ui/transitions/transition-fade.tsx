import m from "mithril";
import {
  UITransition,
  UITransitionAttrs,
} from "src/ts/ui/transitions/transition";
import { sleep } from "src/ts/utils/sleep";

const opacityFrom = "opacity-0";
const opacityMid = "opacity-100";
const opacityEnd = "opacity-0";

export class TransitionFade extends UITransition {
  oninit(vnode: m.Vnode<UITransitionAttrs>) {}

  async oncreate(vnode: m.VnodeDOM<UITransitionAttrs, this>) {
    // wait a bit before starting transition
    await sleep(100);
    vnode.dom.classList.toggle(opacityFrom, false);
    vnode.dom.classList.toggle(opacityMid, true);
    m.redraw();
    // then wait for animation to finish + some delay
    await sleep(500);

    super.oncreate(vnode);
  }

  async onbeforeremove(vnode: m.VnodeDOM): Promise<any> {
    vnode.dom.classList.toggle(opacityMid, false);
    vnode.dom.classList.toggle(opacityEnd, true);
    m.redraw();
    await sleep(500);
  }

  view() {
    return (
      <div
        class={[
          "absolute inset-0 z-50 bg-black transition-opacity duration-500",
          opacityFrom,
        ].join(" ")}
      ></div>
    );
  }
}
