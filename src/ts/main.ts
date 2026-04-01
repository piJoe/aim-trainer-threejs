import m from "mithril";

import { mainUI } from "src/ts/ui/ui";
import { setupRenderer } from "src/ts/renderer";
import { ReplayScreen } from "src/ts/ui/screens/replay-screen";

// setup ui overlay
// m.mount(document.body!, mainUI);

(async () => {
  await setupRenderer();
  m.mount(document.body!, ReplayScreen);
})();
