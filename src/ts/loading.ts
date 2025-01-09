// const loadingScreenDOM = document.querySelector(".loading-screen")!;
// const loadingHintDOM = document.querySelector(".loading-hint")!;

export function setLoadingText(title: string, desc?: string) {
  setLoadingIndicator(true);
  // loadingHintDOM.querySelector(".loading-title")!.textContent =
  // title.toUpperCase();
  // loadingHintDOM.querySelector(".loading-desc")!.textContent =
  // desc?.toUpperCase() ?? "";
}

export function setLoadingIndicator(active: boolean) {
  // loadingHintDOM
  //   .querySelector(".loading-indicator")
  //   ?.classList.toggle("paused", !active);
}

export function toggleLoadingScreen(active: boolean) {
  if (active) {
    // loadingScreenDOM.classList.toggle("loading-done", false);
    // loadingScreenDOM.classList.toggle("loading-fade", false);
    return;
  }

  setLoadingIndicator(false);
  // loadingScreenDOM.classList.toggle("loading-fade", true);
  window.setTimeout(() => {
    // loadingScreenDOM.classList.toggle("loading-done", true);
    // loadingScreenDOM.classList.toggle("loading-fade", false);
  }, 1000);
}
