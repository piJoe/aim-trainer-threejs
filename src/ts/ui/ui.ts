import m from "mithril";
import { LoadingScreen } from "src/ts/ui/screens/loading-screen";
import { UIScreen, UIScreenAttrs } from "src/ts/ui/screens/ui-screen";
import { TransitionSlideBlack } from "src/ts/ui/transitions/transition-slide";
import { v4 } from "uuid";

let screenStack: {
  screen: { new (): UIScreen };
  attrs: UIScreenAttrs;
  key: string;
}[] = [{ screen: LoadingScreen, attrs: {}, key: v4() }];
let transition: TransitionSlideBlack;
export const mainUI = {
  view: () => {
    return [
      m.fragment(
        { key: "screens" },
        screenStack.map((screen, idx) => {
          return m(
            "div",
            { class: "absolute inset-0", key: screen.key },
            m<UIScreenAttrs, UIScreen>(screen.screen, {
              ...screen.attrs,
              isActiveScreen: idx === screenStack.length - 1,
            })
          );
        })
      ),
      m(TransitionSlideBlack, {
        key: "transition",
        oncreate(vnode: m.Vnode<{}, TransitionSlideBlack>) {
          transition = vnode.state;
        },
      }),
    ];
  },
};

// just add on top of the screen stack
export function pushScreen(screen: { new (): UIScreen }) {
  screenStack.push({ screen, attrs: {}, key: v4() });
  m.redraw();
}

export function popScreen() {
  screenStack.pop();
  m.redraw();
}

// push to screen stack as well, but play transition until newest screen is rendered,
// then remove any old screen from stack
export async function screenNavigate(screen: { new (): UIScreen }) {
  await transition.triggerTransition();
  screenStack = [
    {
      screen,
      key: v4(),
      attrs: {
        createCb: async () => {
          await transition.finishTransition();
          m.redraw();
        },
      },
    },
  ];
  m.redraw();
}
