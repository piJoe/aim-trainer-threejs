import m from "mithril";
import { sleep } from "src/ts/utils/sleep";

const translateFrom = "translate-x-[-200%]";
const translateTo = "translate-x-[200%]";

export interface TransitionAttrs {
  screenSwapReadyCb?: () => void;
}

export abstract class Transition implements m.ClassComponent<TransitionAttrs> {
  async oncreate(vnode: m.VnodeDOM<TransitionAttrs, this>) {
    // switch scene in background here!
    if (vnode.attrs.screenSwapReadyCb) vnode.attrs.screenSwapReadyCb();
  }

  view() {}
}
