import m from "mithril";
import { sleep } from "src/ts/utils/sleep";

const translateFrom = "translate-x-[-200%]";
const translateTo = "translate-x-[200%]";

export interface TransitionSlideAttrs {
  callback?: () => void;
}

export class TransitionSlideBlack
  implements m.ClassComponent<TransitionSlideAttrs>
{
  private callback?: () => void;

  oninit(vnode: m.Vnode<TransitionSlideAttrs>) {
    if (vnode.attrs.callback) {
      this.callback = vnode.attrs.callback;
    }
  }

  async oncreate(vnode: m.VnodeDOM) {
    // wait a bit before starting transition
    await sleep(100);
    vnode.dom.classList.toggle(translateFrom, false);
    m.redraw();
    // then wait for animation to finish + some delay
    await sleep(500);

    // switch scene in background here!
    if (this.callback) this.callback();
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
