local TargetManager = {}
local targets = {} -- Internal table to track target data

local __js_calls = {}
local __fromjs = {}

-- setup initial user scenario env
local userScenarioEnv = {
    onInit = nil,
}

-- Adds a target to the manager
function TargetManager.addTarget(config)
    local id = __js_calls.createTarget()
    local target = {
        id = id,
        size = config.size or { radius = 0.09, height = 0.04 },
        position = config.position or { x = 0, y = 0, z = 0 },
        velocity = config.velocity or { x = 0, y = 0, z = 0 },
        maxHP = config.hp or 1,
        hp = config.hp or 1,
        onUpdate = config.onUpdate,
        onDeath = config.onDeath
    }

    TargetManager.updateTarget(target)
    targets[target.id] = target

    function target:setSize(radius, height)
        self.size.radius = radius
        self.size.height = height
    end

    function target:setPosition(x, y, z)
        self.position.x = x
        self.position.y = y
        self.position.z = z
    end

    function target:setHP(hp)
        self.hp = hp
    end

    function target:setVelocity(x, y, z)
        self.velocity.x = x
        self.velocity.y = y
        self.velocity.z = z
    end
end

-- Removes a target from the manager
function TargetManager.removeTarget(targetId)
    targets[targetId] = nil
end

-- internal methods
function TargetManager.updateTarget(target)
    __js_calls.updateTarget(target.id,
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

-- Handler for js side
function __fromjs.handleDeath(targetId)
    local target = targets[targetId]
    if target then
        if target.onDeath then
            target:onDeath()
        end
        TargetManager.removeTarget(targetId)
    end
end

function __fromjs.handleTargetHit(targetId)
    local target = targets[targetId]
    if target then
        if target.onHit then
            target:onHit()
            TargetManager.updateTarget(target)
        end
    end
end

function __fromjs.handleUpdate(elapsed, delta)
    -- if onUpdate then
    --     onUpdate(elapsed, delta)
    -- end
    for _, target in pairs(targets) do
        if target.onUpdate then
            target:onUpdate(elapsed, delta)
            -- __internal_handleMove(target, delta)
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
    if k == "math" or k == "table" or k == "string" or k == "pairs" or k == "ipairs" or k == "print" then
        userScenarioEnv[k] = v
    end
end

local function executeUserScenario(jsCalls, scenarioCode)
    __js_calls = jsCalls
    local userScenario = load(scenarioCode, nil, 't', userScenarioEnv)
    if userScenario then
        userScenario()
    end
    return __fromjs
end
return executeUserScenario
