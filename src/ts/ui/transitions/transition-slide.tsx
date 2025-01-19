import m from "mithril";
import {
  UITransition,
  UITransitionAttrs,
} from "src/ts/ui/transitions/transition";
import { sleep } from "src/ts/utils/sleep";

const translateFrom = "translate-x-[-200%]";
const translateTo = "translate-x-[200%]";
const hidden = "hidden";

export class TransitionSlideBlack extends UITransition {
  private transitionClasslist = new Map<string, boolean>([
    [hidden, true],
    [translateFrom, true],
    [translateTo, false],
  ]);

  async triggerTransition() {
    // wait a bit before starting transition
    this.transitionClasslist.set(hidden, false);
    m.redraw();
    await sleep(50);
    this.transitionClasslist.set(translateFrom, false);
    m.redraw();
    // then wait for animation to finish + some delay
    await sleep(500);
  }

  async finishTransition() {
    // then finish the transition
    this.transitionClasslist.set(translateTo, true);
    m.redraw();
    await sleep(500);

    // finally hide again and reset to from position
    this.transitionClasslist.set(hidden, true);
    this.transitionClasslist.set(translateFrom, true);
    this.transitionClasslist.set(translateTo, false);
    m.redraw();
  }

  view() {
    return (
      <div
        class={[
          "absolute inset-0 z-40 rotate-[-15deg] blur-xl scale-[200%] bg-black transition-transform duration-500",
          ...[...this.transitionClasslist.entries()]
            .filter(([_, enabled]) => {
              return enabled;
            })
            .map(([className]) => {
              return className;
            }),
        ].join(" ")}
      ></div>
    );
  }
}
