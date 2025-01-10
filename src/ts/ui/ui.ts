import m from "mithril";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { UiScreen, UiScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { Transition, TransitionAttrs } from "src/ts/ui/transitions/transition";

let activeScreen: typeof UiScreen = LoadingScreen;
let nextScreen: typeof UiScreen;
let transitionScreen: { new (): Transition } | null = null;
export const mainUI = {
  view: () => {
    return [
      m<UiScreenAttrs, null>(activeScreen, {
        createCb: () => {
          transitionScreen = null;
          m.redraw();
        },
      }),
      transitionScreen
        ? m<TransitionAttrs, null>(transitionScreen, {
            screenSwapReadyCb: () => {
              activeScreen = nextScreen;
              m.redraw();
            },
          })
        : [],
    ];
  },
};

export function setActiveScreen(
  screen: typeof UiScreen,
  transition: { new (): Transition } | null = null
) {
  if (screen === activeScreen) {
    return;
  }

  if (!transition) {
    activeScreen = screen;
    m.redraw();
    return;
  }

  transitionScreen = transition;
  nextScreen = screen;
  m.redraw();
}
