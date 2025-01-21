--[[@SCENARIO
Title: GPT Tracking V2
Type: Tracking
Author: Admin (and GPT)
Description: A scenario with predefined movement patterns for improving on tracking targets
Version: 2.0
]]

local Random = require('helper/random')

-- Scenario Configuration
function onInit()
    -- Global game parameters
    setupRoom(20, 10, 10)
    setCameraPosition(0, 0, 4.5)
    setWeaponRPM(900)
    setTimer(60)

    for i = 1, 5 do
        spawnCustomTarget()
    end
end

-- Abstracted Target Spawning Function
function spawnCustomTarget()
    spawnTarget({
        size = { radius = 0.12, height = 0.05 },
        position = { x = Random.randomFloat(-4, 4), y = Random.randomFloat(-2, 2), z = Random.randomFloat(-2, 2) },
        hp = 10,
        onTick = createMovement(),
        onDeath = function(self, reason)
            if reason == "killed" then
                addScore(10)
            end
        end,
        onAfterDeath = function()
            spawnCustomTarget()
        end
    })
end

function createMovement()
    local amplitude = Random.randomFloat(0.5, 2)     -- Movement amplitude (distance covered)
    local amplitudeY = Random.randomFloat(0.2, 0.5)  -- Movement amplitude (distance covered)
    local frequency = Random.randomFloat(2, 2.5)     -- Movement frequency
    local frequencyY = Random.randomFloat(2.5, 3.5)  -- Movement frequency
    local randomOffset = math.random() * 2 * math.pi -- Randomize start position
    local directionChangeInterval = Random.randomFloat(0.5, 1.5)
    local lastDirectionChangeTime = 0
    local direction = math.pi / 2

    local roomBounds = {
        minX = -9,
        maxX = 9,
        minY = -4,
        maxY = 4,
        minZ = -4,
        maxZ = 4,
    }

    return function(self, elapsedTime, delta)
        if elapsedTime > lastDirectionChangeTime + directionChangeInterval then
            lastDirectionChangeTime = elapsedTime
            if math.random() > 0.5 then
                direction = math.pi / 2
            else
                direction = 0
            end
        end
        -- Calculate new position
        local x = (amplitude * math.cos(frequency * elapsedTime + randomOffset + direction)) +
            ((amplitudeY * 2) * math.cos(frequencyY * 3 * elapsedTime)) +
            (2.5 * math.cos(3 * elapsedTime + randomOffset))
        local y = amplitudeY * math.cos(frequencyY * elapsedTime + randomOffset)
        local z = (amplitude * math.sin(frequency * elapsedTime + randomOffset + direction)) +
            ((amplitudeY * 2) * math.sin(frequencyY * 3 * elapsedTime))

        -- Add random jitter to the movement
        -- local jitterX = randomFloat(-0.5, 0.5)
        -- local jitterZ = randomFloat(-0.5, 0.5)
        local jitterX = 0
        local jitterZ = 0

        -- Update the velocity
        local vel = {
            x = (x + jitterX),
            y = y,
            z = (z + jitterZ)
        }

        -- Check boundaries and adjust velocity if necessary
        local position = self.position -- Get the current position of the target
        if position.x + vel.x * delta < roomBounds.minX or position.x + vel.x * delta > roomBounds.maxX then
            vel.x = -vel.x             -- Reverse X direction
        end
        if position.y + vel.y * delta < roomBounds.minY or position.y + vel.y * delta > roomBounds.maxY then
            vel.y = -vel.y -- Reverse Y direction
        end
        if position.z + vel.z * delta < roomBounds.minZ or position.z + vel.z * delta > roomBounds.maxZ then
            vel.z = -vel.z -- Reverse Z direction
        end

        self:moveBy(vel.x, vel.y, vel.z, delta)
    end
end
