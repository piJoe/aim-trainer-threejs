import m from "mithril";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import {
  UITransition,
  UITransitionAttrs,
} from "src/ts/ui/transitions/transition";

let activeScreen: { new (): UIScreen } = LoadingScreen;
let nextScreens: {
  screen: { new (): UIScreen };
  transition: { new (): UITransition } | null;
}[] = [];
export const mainUI = {
  view: () => {
    const nextScreen = nextScreens.at(0);
    if (nextScreen) {
      if (
        nextScreen.transition === null ||
        nextScreen.screen === activeScreen
      ) {
        if (nextScreen.screen === activeScreen) {
          nextScreens.shift();
        }

        activeScreen = nextScreen.screen;
        nextScreen.transition = null;
      }
    }

    return [
      m<UIScreenAttrs, null>(activeScreen, {
        createCb: () => {
          // m.redraw();
        },
      }),
      nextScreen?.transition
        ? m<UITransitionAttrs, null>(nextScreen.transition, {
            screenSwapReadyCb: () => {
              if (nextScreen) {
                activeScreen = nextScreen.screen;
              }
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
  if (nextScreens.at(-1)?.screen === screen) {
    return;
  }

  nextScreens.push({
    screen,
    transition,
  });
  m.redraw();
}
