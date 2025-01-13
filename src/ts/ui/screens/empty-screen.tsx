import m from "mithril";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";

// basically just a hack for an empty UI, also great template for new screens
export class EmptyScreen
  extends UIScreen
  implements m.ClassComponent<UIScreenAttrs>
{
  view() {}
}
