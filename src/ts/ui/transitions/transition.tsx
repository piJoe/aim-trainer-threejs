import m from "mithril";

const translateFrom = "translate-x-[-200%]";
const translateTo = "translate-x-[200%]";

export interface UITransitionAttrs {
  screenSwapReadyCb?: () => void;
}

export abstract class UITransition
  implements m.ClassComponent<UITransitionAttrs>
{
  async oncreate(vnode: m.VnodeDOM<UITransitionAttrs, this>) {
    // switch scene in background here!
    if (vnode.attrs.screenSwapReadyCb) vnode.attrs.screenSwapReadyCb();
  }

  view() {}
}
