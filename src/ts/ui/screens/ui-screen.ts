import m from "mithril";

export interface UIScreenAttrs {
  createCb?: () => void;
}

export abstract class UIScreen implements m.ClassComponent<UIScreenAttrs> {
  uuid?: string;

  oncreate(vnode: m.VnodeDOM<UIScreenAttrs, this>) {
    if (vnode.attrs.createCb) vnode.attrs.createCb();
  }

  view(vnode: m.Vnode) {}
}
