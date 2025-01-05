-- PASU Scenario Script

local function randomFloat(min, max)
    return min + math.random() * (max - min)
end

-- Scenario Configuration
function onInit()
    -- Global game parameters
    setupRoom(20, 10, 10)
    setCameraPosition(0, 0, 4.5)
    -- setWeaponConfig({ bulletsPerMinute = 600 })
    -- setScenarioTimer(60) -- Scenario lasts 60 seconds

    -- Spawn multiple PASU targets
    for i = 1, 5 do
        spawnPASUTarget()
    end
end

-- Abstracted Target Spawning Function
function spawnPASUTarget()
    spawnTarget({
        size = { radius = 0.12, height = 0.05 },
        position = { x = 0, y = randomFloat(-2, 2), z = randomFloat(-2, 2) },
        hp = 3,
        onTick = createPASUMovement(),
        onDeath = function()
            -- Respawn the target with the same PASU movement
            spawnPASUTarget()
        end,
    })
end

-- Create PASU Movement Pattern
function createPASUMovement()
    local amplitude = randomFloat(0.5, 2)            -- Movement amplitude (distance covered)
    local amplitudeY = randomFloat(0.2, 0.5)         -- Movement amplitude (distance covered)
    local frequency = randomFloat(2, 2.5)            -- Movement frequency
    local frequencyY = randomFloat(2.5, 3.5)         -- Movement frequency
    local randomOffset = math.random() * 2 * math.pi -- Randomize start position
    local directionChangeInterval = randomFloat(0.5, 1.5)
    local lastDirectionChangeTime = 0
    local direction = math.pi / 2

    return function(self, elapsedTime, delta)
        if elapsedTime > lastDirectionChangeTime + directionChangeInterval then
            lastDirectionChangeTime = elapsedTime
            if math.random() > 0.5 then
                direction = math.pi / 2
            else
                direction = 0
            end
        end
        -- Calculate new position based on PASU pattern
        local x = (amplitude * math.cos(frequency * elapsedTime + randomOffset + direction)) +
            ((amplitudeY * 2) * math.cos(frequencyY * 3 * elapsedTime)) +
            (2.5 * math.cos(3 * elapsedTime + randomOffset))
        local y = amplitudeY * math.cos(frequencyY * elapsedTime + randomOffset)
        local z = (amplitude * math.sin(frequency * elapsedTime + randomOffset + direction)) +
            ((amplitudeY * 2) * math.sin(frequencyY * 3 * elapsedTime))

        -- Add random jitter to the movement
        local jitterX = randomFloat(-0.5, 0.5)
        local jitterZ = randomFloat(-0.5, 0.5)

        -- Update the velocity
        local vel = {
            x = (x + jitterX),
            y = y,
            z = (z + jitterZ)
        }

        self:moveBy(vel.x, vel.y, vel.z, delta)
    end
end
