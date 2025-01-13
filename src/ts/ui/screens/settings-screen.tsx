import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";

interface SettingsEntrySliderAttrs {
  label: string;
  value: string;
  min?: string;
  max?: string;
  step?: string;
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
          <span>{vnode.attrs.value}</span>
          <input
            class="w-full accent-primary outline-none appearance-none h-2 bg-white/30 rounded"
            type="range"
            min={vnode.attrs.min}
            max={vnode.attrs.max}
            step={vnode.attrs.step}
            value={vnode.attrs.value}
          />
        </div>
      </div>
    );
  }
}

interface SettingsEntryNumberAttrs {
  label: string;
  value: string;
  min?: string;
  max?: string;
  step?: string;
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
        />
      </div>
    );
  }
}

export class SettingsScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  view() {
    return (
      <div class="h-full bg-purple-flash flex items-center justify-center flex-col gap-5 p-16">
        <div class="w-full max-w-[1200px] text-white">
          <h2 class="font-semibold text-3xl mb-2">Mouse</h2>
          <SettingsEntryNumber
            label="CM/360°"
            value="35"
            min="1"
            step="0.1"
          ></SettingsEntryNumber>
          <SettingsEntryNumber
            label="DPI"
            value="800"
            min="1"
          ></SettingsEntryNumber>
          <SettingsEntryNumber
            label="Sensitivity"
            value="12.54"
            min="0.01"
            step="0.01"
          ></SettingsEntryNumber>

          <h2 class="font-semibold text-3xl mb-2 mt-10">Audio</h2>
          <SettingsEntrySlider
            label="Hit Volume"
            min="0"
            max="1"
            step="0.1"
            value="0.1"
          ></SettingsEntrySlider>
          <SettingsEntrySlider
            label="Miss Volume"
            min="0"
            max="1"
            step="0.1"
            value="0.1"
          ></SettingsEntrySlider>
          <SettingsEntrySlider
            label="Kill Confirm Volume"
            min="0"
            max="1"
            step="0.1"
            value="0.1"
          ></SettingsEntrySlider>
        </div>
      </div>
    );
  }
}
