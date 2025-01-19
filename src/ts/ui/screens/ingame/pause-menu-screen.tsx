import m from "mithril";
import { audioHandler } from "src/ts/audio";
import { renderInstance } from "src/ts/renderer";
import { SettingsScreen } from "src/ts/ui/screens/settings-screen";

import logoStr from "assets/web/logo.svg?raw";
import { KeyboardHint } from "src/ts/ui/components/keyboard-hint";
import { pushScreen, screenNavigate } from "src/ts/ui/ui";
import { InGameScreen } from "src/ts/ui/screens/ingame/ingame-screen";
import { ChooseScreen } from "src/ts/ui/screens/choose-screen";
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

export interface PauseMenuScreenAttrs {
  ingame?: InGameScreen;
}
export class PauseMenuScreen implements m.ClassComponent<PauseMenuScreenAttrs> {
  private keyDownListener!: any;

  oncreate(vnode: m.Vnode<PauseMenuScreenAttrs>) {
    this.keyDownListener = this.keyDownEvent.bind(this);
    document.addEventListener("keydown", this.keyDownListener);
  }

  onremove() {
    document.removeEventListener("keydown", this.keyDownListener);
  }

  keyDownEvent(e: KeyboardEvent) {
    if (!e.repeat && e.key === "Escape") {
      this.backToChoose();
    }
  }

  backToChoose() {
    screenNavigate(ChooseScreen);
  }

  view(vnode: m.Vnode<PauseMenuScreenAttrs>) {
    return (
      <div class="absolute inset-0 flex flex-col backdrop-blur-xl bg-black bg-opacity-50 p-16">
        <div class="w-[120px] text-primary">{logoSvg}</div>
        <ul class="my-auto text-6xl/normal font-medium flex flex-col gap-5">
          <MenuEntry
            label={
              vnode.attrs.ingame?.gameInstance?.hasStarted ? "Continue" : "Play"
            }
            onclick={() => {
              renderInstance.controls?.lock();
            }}
          />
          <MenuEntry
            label="Restart"
            onclick={async () => {
              await vnode.attrs.ingame?.setupScenario();
              renderInstance.controls?.lock();
            }}
          />
          <MenuEntry
            label="Settings"
            onclick={() => {
              pushScreen(SettingsScreen);
            }}
          />
        </ul>
        <div class="flex flex-row items-end">
          <div class="text-white">
            <div class="font-normal">Current Scenario:</div>
            <div class="text-xl font-semibold">
              {vnode.attrs.ingame?.scenarioTitle}
            </div>
          </div>
          <ul class="ml-auto text-xl flex flex-row gap-5">
            <KeyboardHint
              key="ESC"
              interactable
              onclick={() => {
                this.backToChoose();
              }}
            >
              Main Menu
            </KeyboardHint>
            <KeyboardHint key="F11">Fullscreen</KeyboardHint>
          </ul>
        </div>
      </div>
    );
  }
}
