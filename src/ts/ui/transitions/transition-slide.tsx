import m from "mithril";
import { Transition, TransitionAttrs } from "src/ts/ui/transitions/transition";
import { sleep } from "src/ts/utils/sleep";

const translateFrom = "translate-x-[-200%]";
const translateTo = "translate-x-[200%]";

export class TransitionSlideBlack extends Transition {
  oninit(vnode: m.Vnode<TransitionAttrs>) {}

  async oncreate(vnode: m.VnodeDOM<TransitionAttrs, this>) {
    // wait a bit before starting transition
    await sleep(100);
    vnode.dom.classList.toggle(translateFrom, false);
    m.redraw();
    // then wait for animation to finish + some delay
    await sleep(500);

    super.oncreate(vnode);
  }

  async onbeforeremove(vnode: m.VnodeDOM): Promise<any> {
    vnode.dom.classList.toggle(translateTo, true);
    m.redraw();
    await sleep(500);
  }

  view() {
    return (
      <div
        class={[
          "absolute inset-0 z-50 rotate-[-15deg] blur-xl scale-[200%] bg-black transition-transform duration-500",
          translateFrom,
        ].join(" ")}
      ></div>
    );
  }
}
