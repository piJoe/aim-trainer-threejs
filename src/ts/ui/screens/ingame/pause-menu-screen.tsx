import m from "mithril";
import { audioHandler } from "src/ts/audio";
import { renderInstance } from "src/ts/renderer";
import { SettingsScreen } from "src/ts/ui/screens/settings-screen";

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
        // class="w-fit cursor-pointer text-white hover:bg-primary hover:text-black"
        class="w-fit cursor-pointer text-white hover:text-primary"
        onclick={vnode.attrs.onclick}
        onmouseover={() => {
          audioHandler.playMiss();
        }}
      >
        {vnode.attrs.label}
      </li>
    );
  }
}

interface KeyboardHintAttrs {
  key: string;
  interactable?: boolean;
}
class KeyboardHint implements m.ClassComponent<KeyboardHintAttrs> {
  view(vnode: m.Vnode<KeyboardHintAttrs, this>): m.Children {
    return (
      <li
        class={[
          "group font-medium text-white",
          vnode.attrs.interactable && "cursor-pointer hover:text-primary",
        ].join(" ")}
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

// TODO: consider PauseMenuScreen it's own class, not dependent on UIScreen (since it should only be hooked in ingame-screen.tsx)
export class PauseMenuScreen implements m.ClassComponent {
  private settingsOpen = false;

  view() {
    return (
      <div class="absolute inset-0 flex flex-col backdrop-blur-xl bg-black bg-opacity-50 p-16">
        <div class="w-[120px] text-primary">{logoSvg}</div>
        <ul class="my-auto text-6xl/normal font-medium flex flex-col gap-5">
          <MenuEntry
            label="Continue"
            onclick={() => {
              renderInstance.controls?.lock();
            }}
          />
          <MenuEntry
            label="Restart"
            onclick={() => {
              // TODO: somehow retrigger the oninit method in the ingame-screen.tsx, maybe by event?
            }}
          />
          <MenuEntry
            label="Settings"
            onclick={() => {
              this.settingsOpen = true;
            }}
          />
        </ul>
        <div class="flex flex-row items-end">
          <div class="text-white">
            <div class="font-normal">Current Scenario:</div>
            <div class="text-xl font-semibold">GPT Tracking V2</div>
          </div>
          <ul class="ml-auto text-xl flex flex-row gap-5">
            <KeyboardHint key="ESC" interactable>
              Main Menu
            </KeyboardHint>
            <KeyboardHint key="F11">Fullscreen</KeyboardHint>
          </ul>
        </div>

        {this.settingsOpen && (
          <div class="absolute inset-0">
            <SettingsScreen />
          </div>
        )}
      </div>
    );
  }
}
