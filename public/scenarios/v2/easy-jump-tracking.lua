--[[@SCENARIO
Title: Easy Jump Tracking
Type: Tracking
Author: Admin
Description: A scenario with a single target jumping.
Version: 1.0
]]

-- local Random = require('helper/random')
-- local MovementPatterns = require('helper/movement')

-- Scenario Configuration
function onInit()
    -- Global game parameters
    setupRoom(10, 6, 10)
    setCameraPosition(0, -3.0, 2.5)
    setWeaponRPM(900)
    setTimer(60)

    spawnCustomTarget()
end

-- Abstracted Target Spawning Function
function spawnCustomTarget()
    local time = -0.3

    spawnTarget({
        size = { radius = 0.16, height = 0.09 },
        position = { x = 0, y = -4.8, z = -2.8 },
        hp = 0,
        onHit = function()
            addScore(1)
        end,
        onTick = function(self, elapsed, dt)
            time = time + dt
            local height = 6
            local duration = 2
            local t = time / duration

            if t < 0 then
                return
            end
            if t >= 1 then
                self.position.y = -4.8
                time = 0
                return
            end

            local jumpOffset = height * 4 * t * (1 - t) -- Parabolic jump formula
            self.position.y = self.position.y + jumpOffset -
                height * (4 * (t - dt / duration) * (1 - (t - dt / duration)))
        end,
    })
end
