import m from "mithril";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { UiScreen, UiScreenAttrs } from "src/ts/ui/screens/ui-screen";
import {
  TransitionSlideAttrs,
  TransitionSlideBlack,
} from "src/ts/ui/transitions/transition-slide";

let activeScreen: typeof UiScreen = LoadingScreen;
let nextScreen: typeof UiScreen;
let isSwitchingScreen: boolean;
export const mainUI = {
  view: () => {
    return [
      m<UiScreenAttrs, null>(activeScreen, {
        createCb: () => {
          isSwitchingScreen = false;
          m.redraw();
        },
      }),
      isSwitchingScreen
        ? m<TransitionSlideAttrs, null>(TransitionSlideBlack, {
            callback: () => {
              activeScreen = nextScreen;
              m.redraw();
            },
          })
        : [],
    ];
  },
};

export function setActiveScreen(screen: typeof UiScreen, transition = true) {
  if (screen === activeScreen) {
    return;
  }

  if (!transition) {
    activeScreen = screen;
    m.redraw();
    return;
  }

  isSwitchingScreen = true;
  nextScreen = screen;
  m.redraw();
}
