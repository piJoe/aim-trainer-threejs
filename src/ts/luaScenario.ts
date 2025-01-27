import { LuaEngine, LuaFactory } from "wasmoon";
import luaGlueWasmUrl from "wasmoon/dist/glue.wasm?url";
import { DeathReason } from "src/ts/game-objects/game-object";

import luaScenarioRuntime from "src/lua/scenario-runtime.lua?raw";
import luaHelperMovement from "src/lua/helper/movement.lua?raw";
import luaHelperRandom from "src/lua/helper/random.lua?raw";

export interface LuaHandlers {
  handleInit: () => void;
  handleTick: (elapsedTime: number, delta: number) => void;
  handleDeath: (targetId: number, reason: DeathReason) => void;
  handleTargetHit: (targetId: number) => void;
}

let luaInstance: LuaEngine;

async function setupLua() {
  const factory = new LuaFactory(luaGlueWasmUrl);

  // setup modules
  await factory.mountFile("helper/movement.lua", luaHelperMovement);
  await factory.mountFile("helper/random.lua", luaHelperRandom);

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
