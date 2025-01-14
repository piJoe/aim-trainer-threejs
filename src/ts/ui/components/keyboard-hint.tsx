import m from "mithril";

interface KeyboardHintAttrs {
  key: string;
  interactable?: boolean;
  onclick?: () => void;
}
export class KeyboardHint implements m.ClassComponent<KeyboardHintAttrs> {
  view(vnode: m.Vnode<KeyboardHintAttrs, this>): m.Children {
    return (
      <li
        class={[
          "group font-medium text-white",
          vnode.attrs.interactable && "cursor-pointer hover:text-primary",
        ].join(" ")}
        onclick={vnode.attrs.onclick}
      >
        <span
          class={[
            "border-2 border-white/80 px-2 py-1 rounded-md mr-2 font-semibold",
            vnode.attrs.interactable &&
              "group-hover:bg-primary group-hover:border-primary group-hover:text-black",
          ].join(" ")}
        >
          {vnode.attrs.key}
        </span>
        {vnode.children}
      </li>
    );
  }
}
