import m from "mithril";
import {
  userAudioSettings,
  userMouseSettings,
} from "src/ts/stores/user-settings";
import { KeyboardHint } from "src/ts/ui/components/keyboard-hint";
import { PauseMenuScreen } from "src/ts/ui/screens/ingame/pause-menu-screen";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { isActiveScreen, popScreen } from "src/ts/ui/ui";

interface SettingsEntrySliderAttrs {
  label: string;
  value: number;
  onchange: (newVal: number) => void;
}
class SettingsEntrySlider
  implements m.ClassComponent<SettingsEntrySliderAttrs>
{
  view(vnode: m.Vnode<SettingsEntrySliderAttrs, this>): m.Children {
    return (
      <div class="flex flex-row gap-2 w-full h-12 mb-2 bg-black/50 backdrop-blur-xl text-2xl rounded-sm">
        <div class="basis-2/3 px-6 flex flex-row items-center text-2xl font-medium">
          {vnode.attrs.label}
        </div>
        <div class="basis-1/3 px-6 flex flex-row items-center gap-6 text-2xl font-medium">
          <span class="basis-[52px] shrink-0 text-right">
            {(vnode.attrs.value * 100).toFixed(0)}%
          </span>
          <div class="w-full relative flex flex-row items-center">
            <input
              class="w-full appearance-none h-5 opacity-0 cursor-pointer"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vnode.attrs.value}
              oninput={(e: InputEvent) => {
                const val = (e.target as HTMLInputElement).value;
                vnode.attrs.onchange(parseFloat(val));
              }}
            />
            <div class="w-full pointer-events-none h-2 rounded bg-white/30 absolute"></div>
            <div
              class="pointer-events-none h-2 rounded bg-primary absolute"
              style={`width: ${vnode.attrs.value * 100}%;`}
            ></div>
            <div class="inset-x-2.5 h-5 absolute pointer-events-none">
              <div
                class="pointer-events-none h-5 w-5 rounded-full bg-white absolute"
                style={`left: calc(${vnode.attrs.value * 100}% - 10px);`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

interface SettingsEntryNumberAttrs {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onchange: (newVal: number) => void;
}
class SettingsEntryNumber
  implements m.ClassComponent<SettingsEntryNumberAttrs>
{
  view(vnode: m.Vnode<SettingsEntryNumberAttrs, this>): m.Children {
    return (
      <div class="flex flex-row gap-2 w-full h-12 mb-2">
        <div class="basis-2/3 px-6 flex flex-row items-center bg-black/50 backdrop-blur-xl text-2xl font-medium rounded-sm">
          {vnode.attrs.label}
        </div>
        <input
          class="basis-1/3 rounded-sm text-black px-6 text-2xl font-medium focus:outline-none"
          type="number"
          min={vnode.attrs.min}
          max={vnode.attrs.max}
          step={vnode.attrs.step}
          value={vnode.attrs.value}
          oninput={(e: InputEvent) => {
            const val = (e.target as HTMLInputElement).value;
            vnode.attrs.onchange(parseFloat(val));
          }}
        />
      </div>
    );
  }
}

export class SettingsScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  private keyUpListener!: any;

  oncreate(vnode: m.VnodeDOM<UIScreenAttrs>): void {
    this.keyUpListener = this.keyUpEvent.bind(this);
    document.addEventListener("keyup", this.keyUpListener);

    super.oncreate(vnode);
  }
  onremove(vnode: m.VnodeDOM<UIScreenAttrs, this>) {
    document.removeEventListener("keyup", this.keyUpListener);
  }

  keyUpEvent(e: KeyboardEvent) {
    if (!isActiveScreen(this)) return;
    if (e.key === "Escape") {
      popScreen();
    }
  }

  view(vnode: m.Vnode<UIScreenAttrs, this>) {
    const mouseSettings = userMouseSettings.get();
    const audioSettings = userAudioSettings.get();

    return (
      <div class="h-full bg-purple-flash flex items-center justify-center flex-col gap-5 p-16">
        <div class="w-full max-w-[1200px] my-auto text-white">
          <h2 class="font-semibold text-3xl mb-2">Mouse</h2>
          <SettingsEntryNumber
            label="CM/360°"
            value={mouseSettings.cmPer360}
            min="1"
            step="0.1"
            onchange={(val: number) => {
              userMouseSettings.setKey("cmPer360", val);
            }}
          ></SettingsEntryNumber>
          <SettingsEntryNumber
            label="DPI"
            value={mouseSettings.dpi}
            min="1"
            onchange={(val: number) => {
              userMouseSettings.setKey("dpi", val);
            }}
          ></SettingsEntryNumber>

          <h2 class="font-semibold text-3xl mb-2 mt-10">Audio</h2>
          <SettingsEntrySlider
            label="Hit Volume"
            value={audioSettings.volumeHit}
            onchange={(val: number) => {
              userAudioSettings.setKey("volumeHit", val);
            }}
          ></SettingsEntrySlider>
          <SettingsEntrySlider
            label="Miss Volume"
            value={audioSettings.volumeMiss}
            onchange={(val: number) => {
              userAudioSettings.setKey("volumeMiss", val);
            }}
          ></SettingsEntrySlider>
          <SettingsEntrySlider
            label="Kill Confirm Volume"
            value={audioSettings.volumeKill}
            onchange={(val: number) => {
              userAudioSettings.setKey("volumeKill", val);
            }}
          ></SettingsEntrySlider>
        </div>

        <div class="flex flex-row items-end w-full">
          <ul class="ml-auto text-xl flex flex-row gap-5">
            <KeyboardHint
              key="ESC"
              interactable
              onclick={() => {
                popScreen();
              }}
            >
              Back
            </KeyboardHint>
          </ul>
        </div>
      </div>
    );
  }
}
