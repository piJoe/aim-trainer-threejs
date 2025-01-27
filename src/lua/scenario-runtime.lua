local TargetManager = {}
local targets = {} -- Internal table to track target data

local __js_calls = {}
local __fromjs = {}

-- setup initial user scenario env
local userScenarioEnv = {
    onTick = nil,
    onInit = nil,
}

-- Adds a target to the manager
function TargetManager.addTarget(config)
    if not config then config = {} end
    local id = __js_calls.createTarget()
    local target = {
        id = id,
        size = config.size or { radius = 0.09, height = 0.04 },
        position = config.position or { x = 0, y = 0, z = 0 },
        maxHP = config.hp or 1,
        hp = config.hp or 1,
        onTick = config.onTick,
        onDeath = config.onDeath,
        onAfterDeath = config.onAfterDeath,
        onHit = config.onHit,
    }

    TargetManager.setupTarget(target)
    targets[target.id] = target

    function target:setPosition(x, y, z)
        self.position.x = x
        self.position.y = y
        self.position.z = z
    end

    function target:moveBy(x, y, z, delta)
        self.position.x = self.position.x + (x * delta)
        self.position.y = self.position.y + (y * delta)
        self.position.z = self.position.z + (z * delta)
    end

    function target:setHP(hp)
        self.hp = hp
    end

    function target:addHP(add)
        self.hp = self.hp + add
    end

    function target:despawn()
        __js_calls.despawnTarget(target.id)
    end
end

-- Removes a target from the manager
function TargetManager.removeTarget(targetId)
    targets[targetId] = nil
end

-- internal methods
function TargetManager.setupTarget(target)
    __js_calls.setupTarget(target.id,
        -- size
        target.size.radius,
        target.size.height,
        -- position
        target.position.x,
        target.position.y,
        target.position.z,
        -- hp
        target.maxHP,
        target.hp)
end

function TargetManager.updateTarget(target)
    __js_calls.updateTarget(target.id,
        -- position
        target.position.x,
        target.position.y,
        target.position.z,
        -- hp
        target.hp)
end

-- Handler for js side
function __fromjs.handleDeath(targetId, reason)
    local target = targets[targetId]
    if target then
        if target.onDeath then
            target:onDeath(reason)
        else
            if reason == "killed" then
                __js_calls.addScore(1)
            end
        end

        if target.onAfterDeath then
            target:onAfterDeath()
        end

        TargetManager.removeTarget(targetId)
    end
end

function __fromjs.handleTargetHit(targetId)
    local target = targets[targetId]
    if target then
        if target.onHit then
            target:onHit()
        else
            target:addHP(-1)
        end
        TargetManager.updateTarget(target)
    end
end

function __fromjs.handleTick(elapsed, delta)
    if userScenarioEnv.onTick then
        userScenarioEnv.onTick(elapsed, delta)
    end

    for _, target in pairs(targets) do
        if target.onTick then
            target:onTick(elapsed, delta)
            TargetManager.updateTarget(target)
        end
    end
end

function __fromjs.handleInit()
    if userScenarioEnv.onInit then
        userScenarioEnv.onInit()
    end
end

-- Expose high-level functions to user scripts
local SafeAPI = {}
function SafeAPI.spawnTarget(config)
    TargetManager.addTarget(config)
end

function SafeAPI.addScore(points)
    __js_calls.addScore(points)
end

-- TODO: expose createWall method to __js_calls to allow for more creative room layouts by setting walls manually in scenario code
-- also: add helper functions for basic room shapes rectangular, cylindrical, etc.
function SafeAPI.setupRoom(width, length, height)
    __js_calls.setRoomSize(width, length, height)
end

function SafeAPI.setCameraPosition(x, y, z)
    __js_calls.setCameraPosition(x, y, z)
end

function SafeAPI.setWeaponRPM(rpm)
    __js_calls.setWeaponRPM(rpm)
end

function SafeAPI.setTimer(seconds)
    __js_calls.setTimer(seconds)
end

-- put API in our user scenario environment
for k, v in pairs(SafeAPI) do
    userScenarioEnv[k] = v
end

-- put safe globals into user scenario env
for k, v in pairs(_G) do
    if k == "math" or k == "table" or k == "string" or k == "pairs" or k == "ipairs" or k == "print" or k == "require" then
        userScenarioEnv[k] = v
    end
end

local function executeUserScenario(jsCalls, scenarioCode)
    __js_calls = jsCalls

    local userScenario, err = load(scenarioCode, nil, 't', userScenarioEnv)
    if err then
        print(err)
    end
    if userScenario then
        userScenario()
    end
    return __fromjs
end
return executeUserScenario
