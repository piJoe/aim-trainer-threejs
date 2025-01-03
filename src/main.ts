import { AimControls } from "./aim-controls";
import { Crosshair } from "./crosshair";
import { Game } from "./game";
import { LuaFactory } from "wasmoon";
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { AudioHandler } from "./audio";

// lua imports (handled by esbuild)
import luaScenarioRuntime from "./lua/scenario-runtime.lua";
import { runLuaScenario } from "./luaScenario";

const scene = new Scene();
const hfov = 103;
const aspectRatio = window.innerWidth / window.innerHeight;
const vfov =
  2 *
  Math.atan(Math.tan((hfov * Math.PI) / 180 / 2) / aspectRatio) *
  (180 / Math.PI);

const camera = new PerspectiveCamera(vfov, aspectRatio, 0.1, 1000);
camera.position.z = 1.5;

const raycastCam = camera.clone();

const controls = new AimControls(camera, document.body);
window.addEventListener("click", () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

const renderer = new WebGLRenderer();
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const overlayCamera = new OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  1,
  10
);
overlayCamera.position.z = 1;
const overlayScene = new Scene();
const crosshair = new Crosshair(6, 2);
overlayScene.add(crosshair.object);

const audio = new AudioHandler(camera);

async function testLuaScript() {
  const factory = new LuaFactory("/.build/glue.wasm");
  const lua = await factory.createEngine({
    // openStandardLibs: false,
    injectObjects: false,
    enableProxy: false,
  });
  try {
    lua.global.set("spawnTarget", ({ ...opts }) => {
      console.log("spawnTarget", opts);
    });

    // benchmark test
    const benchmark = async () => {
      // Load Lua script
      await lua.doString(`
    globalTargets = {}

    function spawnTarget(i)
        target = {
          position = {x = i, y = i, z = i}, 
          velocity = {x = 0.1, y = 0.2, z = 0.3},
          boundingBox = {min = {x = 0, y = 0, z = 0}, max = {x = 100, y = 100, z = 100}},
          update = function(self)
            updateTarget(self, self.boundingBox)
          end,
          updateCB = function(self)
            updateTarget(self, self.boundingBox)
            updateTargetJS(self.position, self.velocity)
          end,
          updateCBFlat = function(self)
            updateTarget(self, self.boundingBox)
            -- updateTargetJSFlat(self.position.x, self.position.y, self.position.z, self.velocity.x, self.velocity.y, self.velocity.z)
            -- updateTargetJSFlat(self.position.x .. "/" .. self.position.y .. "/" .. self.position.z .. "/" .. self.velocity.x .. "/" .. self.velocity.y .. "/" .. self.velocity.z)
            updateTargetJSFlat("{\\"position\\": {\\"x\\": " .. self.position.x .. ",\\"y\\": " .. self.position.y .. ",\\"z\\": " .. self.position.z .. "}, \\"velocity\\": {\\"x\\": " .. self.velocity.x .. ",\\"y\\": " .. self.velocity.y .. ",\\"z\\": " .. self.velocity.z .. "}}")
          end
        }
        table.insert(globalTargets, target)
        -- return target    
    end

    -- Lua functions as defined earlier
    function updateTarget(target, boundingBox)
        target.position.x = target.position.x + target.velocity.x
        target.position.y = target.position.y + target.velocity.y
        target.position.z = target.position.z + target.velocity.z

        -- Constrain within bounding box
        if target.position.x < boundingBox.min.x then target.position.x = boundingBox.min.x end
        if target.position.x > boundingBox.max.x then target.position.x = boundingBox.max.x end

        if target.position.y < boundingBox.min.y then target.position.y = boundingBox.min.y end
        if target.position.y > boundingBox.max.y then target.position.y = boundingBox.max.y end

        if target.position.z < boundingBox.min.z then target.position.z = boundingBox.min.z end
        if target.position.z > boundingBox.max.z then target.position.z = boundingBox.max.z end

        return target
    end

    function updateTargets(targets, boundingBox)
        for i, target in ipairs(targets) do
            target = updateTarget(target, boundingBox)
        end
        return targets
    end

    function batchUpdateTargets()
        targets = {}
        for i, target in ipairs(globalTargets) do
          target:update()
          table.insert(targets, {position= target.position, velocity= target.velocity})
        end
        return targets
    end
    
    function batchUpdateTargetsWithCallback()
        for i, target in ipairs(globalTargets) do
          target:updateCB()
        end
    end

    function batchUpdateTargetsWithCallbackFlat()
        for i, target in ipairs(globalTargets) do
          target:updateCBFlat()
        end
    end
    
    function batchUpdateJSON()
        json = "["
        for i, target in ipairs(globalTargets) do
          target:update()
          json = json .. "{\\"position\\": {\\"x\\": " .. target.position.x .. ",\\"y\\": " .. target.position.y .. ",\\"z\\": " .. target.position.z .. "}, \\"velocity\\": {\\"x\\": " .. target.velocity.x .. ",\\"y\\": " .. target.velocity.y .. ",\\"z\\": " .. target.velocity.z .. "}},"
        end
        json = json:sub(1, -2) .. "]"
        return json
    end
    
    function getGlobalTargets()
        return globalTargets
    end
`);

      // Create targets and bounding box
      let targets = Array.from({ length: 20 }, (_, i) => ({
        position: { x: i, y: i, z: i },
        velocity: { x: 0.1, y: 0.2, z: 0.3 },
      }));

      const boundingBox = {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 100, y: 100, z: 100 },
      };

      // Benchmark helper
      function measure(label: any, callback: any) {
        const start = performance.now();
        callback();
        const end = performance.now();
        console.log(`${label}: ${(end - start).toFixed(4)} ms`);
      }

      // Benchmark single calls
      const updateTarget = lua.global.get("updateTarget");
      measure("Single Target Updates", () => {
        targets = targets.map((target) => {
          return updateTarget(target, boundingBox);
        });
      });

      // Benchmark batch updates
      const updateTargets = lua.global.get("updateTargets");
      measure("Batch Target Updates", () => {
        targets = updateTargets(targets, boundingBox);
      });

      console.log(targets);

      // Benchmark handing inside lua
      const spawn = lua.global.get("spawnTarget");
      measure("spawn targets", () => {
        const luaTargets = Array.from({ length: 50 }, (_, i) => spawn(i));
      });
      const globalTargets = lua.global.get("getGlobalTargets");

      const batchupdate = lua.global.get("batchUpdateTargets");
      let t = null;
      measure("Batch call global table", () => {
        for (let i = 0; i < 10; i++) {
          t = batchupdate();
        }
      });
      console.log(t);

      const alltargets: any[] = [];
      lua.global.set("updateTargetJS", (position, velocity) => {
        // do nothing for now
        alltargets.push({
          pos: position,
          vel: velocity,
        });
      });

      lua.global.set("updateTargetJSFlat", (json) => {
        // do nothing for now
        alltargets.push(JSON.parse(json));
      });

      const batchupdateCB = lua.global.get("batchUpdateTargetsWithCallback");
      measure("Batch call global table with Callbacks", () => {
        for (let i = 0; i < 1_000; i++) {
          batchupdateCB();
        }
      });

      const batchupdateCBFlat = lua.global.get(
        "batchUpdateTargetsWithCallbackFlat"
      );
      measure("Batch call global table with Callbacks Flat", () => {
        for (let i = 0; i < 1_000; i++) {
          batchupdateCBFlat();
        }
      });
      console.log(alltargets);

      const batchupdateJSON = lua.global.get("batchUpdateJSON");
      measure("Batch call global table", () => {
        for (let i = 0; i < 1_000; i++) {
          t = batchupdateJSON();
        }
      });
      console.log(t);
    };
    // await benchmark();

    // our new and shiny sandboxed scenario runtime
    try {
      const executeScenario = await lua.doString(luaScenarioRuntime);
      const calls = {
        createTarget: null,
        updateTarget: null,
        setRoomSize: null,
        setCameraPosition: null,
        setWeaponRPM: null,
        setTimer: null,
      };
      const handlers = executeScenario(calls, `print("BLA BLA")`);
      // grab following from handlers:
      // handleDeath
      // handleTargetHit
      // handleInit
      // handleUpdate
    } catch (e) {
      console.log(e);
    }

    return;
    const luaStr = await (await fetch("/examples/movement-test.lua")).text();

    const script = await lua.doString(luaStr);
    const config = script.setup();

    // setup game based on config received from lua script
    const game = new Game(
      camera,
      raycastCam,
      scene,
      new Raycaster(),
      controls,
      audio
    );
    await game.setup(config);

    lua.global.set("spawnTarget", ({ ...opts }) => {
      game.spawnTarget(opts as any);
    });
    script.onInit();

    const clock = new Clock();
    let firstFrame = true;
    function render() {
      const elapsedTime = clock.elapsedTime;
      const delta = clock.getDelta();
      if (!controls.isLocked && !firstFrame) {
        return;
      }

      game.onTick(elapsedTime, delta);

      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCamera);

      firstFrame = false;
    }
    scene.updateMatrixWorld();
    renderer.setAnimationLoop(render);
  } finally {
    // lua.global.close();
  }
}
// testLuaScript();

(async () => {
  const game = new Game(controls, audio);
  const luaCalls = game.getLuaCalls();
  const handlers = await runLuaScenario(
    luaCalls,
    `
    function onInit()
      setupRoom(4, 4, 3)
      setCameraPosition(0, 0, 1.5)
      spawnTarget({
        size = {radius = 0.12, height = 0},
        position = {x = 1.25, y = 1, z = -1.0},
      })
    end
  `
  );

  // handle init on lua side, then setup game
  handlers.handleInit();
  const { scene, camera } = await game.setup();

  const clock = new Clock();
  let firstFrame = true;
  function render() {
    const elapsedTime = clock.elapsedTime;
    const delta = clock.getDelta();
    if (!controls.isLocked && !firstFrame) {
      return;
    }

    game.onTick(elapsedTime, delta);

    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(overlayScene, overlayCamera);

    firstFrame = false;
  }
  scene.updateMatrixWorld();
  renderer.setAnimationLoop(render);
})();
