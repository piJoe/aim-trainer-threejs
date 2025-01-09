import m from "mithril";
import { LoadingIndicator } from "src/ts/ui/components/loading-indicator";

import logoStr from "assets/web/logo.svg?raw";
import { UiScreen } from "src/ts/ui/screens/ui-screen";
const logoSvg = m.trust(logoStr);

export class LoadingScreen extends UiScreen {
  view() {
    return (
      <div class="h-full bg-purple-flash flex items-center justify-center flex-col gap-5 p-16">
        <div class="w-[50vw] max-h-[50vh] max-w-[600px] text-primary">
          {logoSvg}
        </div>
        <LoadingIndicator
          loadingTitle="LOADING"
          loadingDesc="SOME DESCRIPTION"
        ></LoadingIndicator>
      </div>
    );
  }
}
