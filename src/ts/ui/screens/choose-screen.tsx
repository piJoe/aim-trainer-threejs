import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { KeyboardHint } from "src/ts/ui/components/keyboard-hint";
import { screenNavigate } from "src/ts/ui/ui";
import {
  InGameScreen,
  InGameScreenAttrs,
} from "src/ts/ui/screens/ingame/ingame-screen";

import thumbnailClickingUrl from "assets/web/thumbnails/clicking.svg?url";
import thumbnailTrackginUrl from "assets/web/thumbnails/tracking.svg?url";
import thumbnailSwitchingUrl from "assets/web/thumbnails/switching.svg?url";

enum ScenarioType {
  CLICKING = "clicking",
  TRACKING = "tracking",
  SWITCHING = "switching",
}

interface ScenarioTypeTagAttrs {
  type: ScenarioType;
}
class ScenarioTypeTag implements m.ClassComponent<ScenarioTypeTagAttrs> {
  view(vnode: m.Vnode<ScenarioTypeTagAttrs, this>): m.Children {
    const bgColor =
      vnode.attrs.type === ScenarioType.CLICKING
        ? "bg-scenario-clicking"
        : vnode.attrs.type === ScenarioType.SWITCHING
        ? "bg-scenario-switching"
        : vnode.attrs.type === ScenarioType.TRACKING
        ? "bg-scenario-tracking"
        : "";
    return (
      <div
        class={[
          "text-white font-normal text-lg h-[22px] px-2 flex items-center w-fit",
          bgColor,
        ].join(" ")}
      >
        {vnode.attrs.type}
      </div>
    );
  }
}

interface PlaceholderThumbnailAttrs {
  type: ScenarioType;
}
class PlaceholderThumbnail
  implements m.ClassComponent<PlaceholderThumbnailAttrs>
{
  view(vnode: m.Vnode<PlaceholderThumbnailAttrs, this>): m.Children {
    const url =
      vnode.attrs.type === ScenarioType.CLICKING
        ? thumbnailClickingUrl
        : vnode.attrs.type === ScenarioType.SWITCHING
        ? thumbnailSwitchingUrl
        : vnode.attrs.type === ScenarioType.TRACKING
        ? thumbnailTrackginUrl
        : "";
    return <img src={url} class="w-full" />;
  }
}

interface ScenarioCardAttrs {
  title: string;
  author: string;
  type: ScenarioType;
  scenarioUrl: string;
  thumbnailUrl?: string;
}
class ScenarioCard implements m.ClassComponent<ScenarioCardAttrs> {
  view(vnode: m.Vnode<ScenarioCardAttrs, this>): m.Children {
    const borderColor =
      vnode.attrs.type === ScenarioType.CLICKING
        ? "bg-scenario-clicking"
        : vnode.attrs.type === ScenarioType.SWITCHING
        ? "bg-scenario-switching"
        : vnode.attrs.type === ScenarioType.TRACKING
        ? "bg-scenario-tracking"
        : "bg-black";
    return (
      <div
        class={[
          "w-[360px] box-content flex flex-col p-2 rounded-2xl flex-shrink-0 cursor-pointer hover:scale-105 transition-transform",
          borderColor,
        ].join(" ")}
        onclick={() => {
          screenNavigate<InGameScreen, InGameScreenAttrs>(InGameScreen, {
            scenarioUrl: vnode.attrs.scenarioUrl,
            scenarioTitle: vnode.attrs.title,
          });
        }}
      >
        <div>
          <PlaceholderThumbnail type={vnode.attrs.type} />
        </div>
        <div class="text-white bg-black px-4 py-5 rounded-b-xl">
          <div class="font-medium text-xl/6 normal-case">
            {vnode.attrs.title}
          </div>
          <div class="font-normal text-lg/5 normal-case mb-2.5">
            by {vnode.attrs.author}
          </div>
          <ScenarioTypeTag type={vnode.attrs.type} />
        </div>
      </div>
    );
  }
}

export class ChooseScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  oninit(vnode: m.Vnode) {}

  onremove(vnode: m.VnodeDOM) {}

  view() {
    return (
      <div class="h-full bg-purple-flash flex items-center justify-center flex-col gap-5 p-16">
        <div class="w-full my-auto py-14 overflow-x-auto">
          <div class="flex flex-row gap-10 w-fit px-10 mx-auto">
            <ScenarioCard
              title="GPT Switching V2"
              author="Admin (and GPT)"
              scenarioUrl="/scenarios/v2/gpt-switching.lua"
              type={ScenarioType.SWITCHING}
            />
            <ScenarioCard
              title="GPT Tracking V2"
              author="Admin (and GPT)"
              scenarioUrl="/scenarios/v2/gpt-tracking.lua"
              type={ScenarioType.TRACKING}
            />
            <ScenarioCard
              title="Easy Jump Tracking"
              author="Admin"
              scenarioUrl="/scenarios/v2/easy-jump-tracking.lua"
              type={ScenarioType.TRACKING}
            />
            <ScenarioCard
              title="Easy Horizontal Tracking"
              author="Admin"
              scenarioUrl="/scenarios/v2/easy-horizontal-tracking.lua"
              type={ScenarioType.TRACKING}
            />
          </div>
        </div>
        <div class="flex flex-row items-end w-full">
          <ul class="ml-auto text-xl flex flex-row gap-5">
            <KeyboardHint
              key="F2"
              interactable
              onclick={() => {
                // TODO: open modal for entering lua code
              }}
            >
              Enter Code
            </KeyboardHint>
          </ul>
        </div>
      </div>
    );
  }
}
