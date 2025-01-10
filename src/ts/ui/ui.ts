import m from "mithril";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import {
  UITransition,
  UITransitionAttrs,
} from "src/ts/ui/transitions/transition";

let activeScreen: { new (): UIScreen } = LoadingScreen;
let nextScreen: { new (): UIScreen };
let transitionScreen: { new (): UITransition } | null = null;
export const mainUI = {
  view: () => {
    return [
      m<UIScreenAttrs, null>(activeScreen, {
        createCb: () => {
          transitionScreen = null;
          m.redraw();
        },
      }),
      transitionScreen
        ? m<UITransitionAttrs, null>(transitionScreen, {
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
  screen: { new (): UIScreen },
  transition: { new (): UITransition } | null = null
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
