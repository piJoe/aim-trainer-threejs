import m from "mithril";

import logoStr from "assets/web/logo.svg?raw";
import { UiScreen } from "src/ts/ui/screens/ui-screen";
const logoSvg = m.trust(logoStr);

export class OtherScreen extends UiScreen {
  view() {
    return (
      <div class="h-full bg-white flex lex-col gap-5 p-16">
        <div class="w-[50vw] max-h-[50vh] max-w-[600px] text-primary">
          {logoSvg}
        </div>
      </div>
    );
  }
}
