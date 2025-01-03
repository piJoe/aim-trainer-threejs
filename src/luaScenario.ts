import { LuaEngine, LuaFactory } from "wasmoon";
import luaScenarioRuntime from "./lua/scenario-runtime.lua";

interface LuaHandlers {
  handleInit: () => void;
  handleTick: (elapsedTime: number, delta: number) => void;
  // TODO: add remaining
}

let luaInstance: LuaEngine;

async function setupLua() {
  const factory = new LuaFactory("/.build/glue.wasm");
  const lua = await factory.createEngine({
    injectObjects: false,
    enableProxy: false,
  });

  luaInstance = lua;
}

export async function runLuaScenario(
  gameAPI: any,
  userScenarioString: string
): Promise<LuaHandlers> {
  try {
    // setup lua engine first if not already exists
    if (!luaInstance) await setupLua();

    // load our base runtime in
    const executeScenario = await luaInstance.doString(luaScenarioRuntime);

    // execute the userScenario
    const handlers = executeScenario(
      gameAPI,
      userScenarioString
    ) as LuaHandlers;

    // grab following from handlers:
    // handleDeath
    // handleTargetHit
    // handleInit
    // handleUpdate
    return handlers;
  } catch (e) {
    throw e;
  }
}
