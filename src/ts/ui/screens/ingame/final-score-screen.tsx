import m from "mithril";
import { KeyboardHint } from "src/ts/ui/components/keyboard-hint";
import { InGameScreen } from "src/ts/ui/screens/ingame/ingame-screen";

export interface FinalScoreScreenAttrs {
  ingameScreen: InGameScreen;
}
export class FinalScoreScreen
  implements m.ClassComponent<FinalScoreScreenAttrs>
{
  private ingameScreen?: InGameScreen;
  private keyDownListener!: any;

  oncreate(vnode: m.Vnode<FinalScoreScreenAttrs>) {
    this.ingameScreen = vnode.attrs.ingameScreen;
    this.keyDownListener = this.keyDownEvent.bind(this);
    document.addEventListener("keydown", this.keyDownListener);
  }
  onremove() {
    document.removeEventListener("keydown", this.keyDownListener);
  }

  keyDownEvent(e: KeyboardEvent) {
    if (!e.repeat && e.key === "Escape") {
      this.restartAndBackToMenu();
    }
  }

  restartAndBackToMenu() {
    this.ingameScreen?.setupScenario();
    m.redraw();
  }

  view(vnode: m.Vnode<FinalScoreScreenAttrs>) {
    const state = vnode.attrs.ingameScreen.gameInstance?.gameStore.get();
    return (
      <div class="absolute inset-0 flex flex-col justify-center items-center backdrop-blur-xl bg-black bg-opacity-50 p-16">
        <div class="text-white m-auto font-medium flex flex-col items-center gap-4">
          <div class="flex flex-col items-center gap-4">
            <div class="text-6xl">Final Score</div>
            <div class="text-8xl font-bold">{state?.score}</div>
          </div>
          <div class="flex flex-row text-3xl font-medium gap-8">
            <div>
              Avg TTK:&nbsp;<span class="font-semibold">{state?.avgTTK}s</span>
            </div>
            <div>
              Accuracy:&nbsp;
              <span class="font-semibold">
                {(
                  ((state?.shotsHit ?? 1) / (state?.totalShots ?? 1)) *
                  100
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
          <div class="flex flex-row text-2xl font-medium">
            Scenario:&nbsp;
            <span class="font-semibold">
              {vnode.attrs.ingameScreen.scenarioTitle}
            </span>
          </div>
        </div>
        <div class="flex flex-row items-end w-full">
          <ul class="ml-auto text-xl flex flex-row gap-5">
            <KeyboardHint
              key="ESC"
              interactable
              onclick={() => {
                this.restartAndBackToMenu();
              }}
            >
              BACK
            </KeyboardHint>
          </ul>
        </div>
      </div>
    );
  }
}
