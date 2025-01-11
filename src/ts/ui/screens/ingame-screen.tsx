import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";

export class InGameScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  view() {
    return <canvas />;
  }
}
