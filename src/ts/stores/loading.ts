import { map } from "nanostores";
import { EmptyScreen } from "src/ts/ui/screens/empty-screen";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { TransitionSlideBlack } from "src/ts/ui/transitions/transition-slide";
import { setActiveScreen } from "src/ts/ui/ui";

interface LoadingState {
  title: string;
  description: string;
  paused: boolean;
}

export const loadingState = map<LoadingState>({
  title: "",
  description: "",
  paused: false,
});

export function setLoadingText(title: string, desc?: string) {
  loadingState.set({
    title,
    description: desc ?? "",
    paused: false,
  });
}

export function toggleLoadingScreen(active: boolean) {
  if (active) {
    loadingState.setKey("paused", false);
    setActiveScreen(LoadingScreen, TransitionSlideBlack);
    return;
  }

  loadingState.setKey("paused", true);
  setActiveScreen(EmptyScreen, TransitionSlideBlack);
}
