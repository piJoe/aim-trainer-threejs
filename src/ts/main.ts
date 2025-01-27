import m from "mithril";

import { mainUI } from "src/ts/ui/ui";
import { setupRenderer } from "src/ts/renderer";

// setup ui overlay
m.mount(document.body!, mainUI);

(async () => {
  await setupRenderer();
})();
