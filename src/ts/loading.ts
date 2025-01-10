import m from "mithril";
import { EmptyScreen } from "src/ts/ui/screens/empty-screen";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { TransitionSlideBlack } from "src/ts/ui/transitions/transition-slide";
import { setActiveScreen } from "src/ts/ui/ui";

export const globalLoadingState = {
  title: "",
  description: "",
  paused: false,
};

export function setLoadingText(title: string, desc?: string) {
  setLoadingIndicator(true);
  globalLoadingState.title = title;
  globalLoadingState.description = desc ?? "";
  m.redraw();
}

function setLoadingIndicator(active: boolean) {
  globalLoadingState.paused = !active;
}

export function toggleLoadingScreen(active: boolean) {
  if (active) {
    setActiveScreen(LoadingScreen);
    return;
  }

  setLoadingIndicator(false);
  setActiveScreen(EmptyScreen, TransitionSlideBlack);
}
