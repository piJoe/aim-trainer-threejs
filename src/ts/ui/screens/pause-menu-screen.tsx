import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";

import logoStr from "assets/web/logo.svg?raw";
const logoSvg = m.trust(logoStr);

interface MenuEntryAttrs {
  label: string;
  onclick: () => void;
}
class MenuEntry implements m.ClassComponent<MenuEntryAttrs> {
  view(vnode: m.Vnode<MenuEntryAttrs, this>): m.Children {
    return (
      <li
        class="w-fit cursor-pointer text-white hover:bg-white hover:text-black"
        onclick={vnode.attrs.onclick}
      >
        {vnode.attrs.label}
      </li>
    );
  }
}

interface KeyboardHintAttrs {
  key: string;
}
class KeyboardHint implements m.ClassComponent<KeyboardHintAttrs> {
  view(vnode: m.Vnode<KeyboardHintAttrs, this>): m.Children {
    return (
      <li>
        <span class="border-2 border-white/80 px-2 py-1 rounded-md mr-5">
          {vnode.attrs.key}
        </span>
        {vnode.children}
      </li>
    );
  }
}

// basically just a hack for an empty UI above the game canvas
export class PauseMenuScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  view() {
    return (
      <div class="h-full flex flex-col backdrop-blur-xl bg-black bg-opacity-50 p-16">
        <div class="w-[120px] text-primary">{logoSvg}</div>
        <ul class="my-auto text-6xl/normal flex flex-col gap-5">
          <MenuEntry label="Continue" onclick={() => {}} />
          <MenuEntry label="Restart" onclick={() => {}} />
          <MenuEntry label="Choose Scenario" onclick={() => {}} />
          <MenuEntry label="Editor" onclick={() => {}} />
          <MenuEntry label="Settings" onclick={() => {}} />
        </ul>
        <div class="flex flex-row items-end">
          <div>
            <div class="text-sm">Current Scenario:</div>
            <div class="text-xl">GPT Tracking V2</div>
          </div>
          <ul class="ml-auto block text-xl">
            <KeyboardHint key="F11">Fullscreen</KeyboardHint>
          </ul>
        </div>
      </div>
    );
  }
}
