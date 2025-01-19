import { map } from "nanostores";

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

export function setLoadingNoText() {
  loadingState.set({
    title: "",
    description: "",
    paused: false,
  });
}

export function setLoadingPaused(paused: boolean) {
  loadingState.setKey("paused", paused);
}
