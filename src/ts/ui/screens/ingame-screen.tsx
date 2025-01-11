import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";

export class InGameScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  view() {
    return (
      <div>
        <canvas />
        {/*TODO: add ingame overlay, visible only when running*/}
        {/*TODO: add ingame pause menu, visible only when paused*/}
      </div>
    );
  }
}
