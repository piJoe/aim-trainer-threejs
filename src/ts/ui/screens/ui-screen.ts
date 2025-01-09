import m from "mithril";

export interface UiScreenAttrs {
  createCb?: () => void;
}

export class UiScreen implements m.ClassComponent<UiScreenAttrs> {
  oncreate(vnode: m.VnodeDOM<UiScreenAttrs>) {
    if (vnode.attrs.createCb) vnode.attrs.createCb();
  }

  view() {}
}