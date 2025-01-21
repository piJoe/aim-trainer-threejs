--[[@SCENARIO
Title: Easy Horizontal Tracking
Type: Tracking
Author: Admin
Description: A scenario with a single target oscillating from left to right.
Version: 1.0
]]

-- local Random = require('helper/random')
local MovementPatterns = require('helper/movement')

-- Scenario Configuration
function onInit()
    -- Global game parameters
    setupRoom(20, 8, 6)
    setCameraPosition(0, 0.0, 3.5)
    setWeaponRPM(900)
    setTimer(60)

    spawnCustomTarget()
end

-- Abstracted Target Spawning Function
function spawnCustomTarget()
    local zigzag = MovementPatterns.zigzag({ x = 1, y = 0, z = 0 }, 20, 3)

    spawnTarget({
        size = { radius = 0.09, height = 0.4 },
        position = { x = 0, y = 0, z = -2.8 },
        hp = 0,
        onHit = function()
            addScore(1)
        end,
        onTick = function(self, elapsed, dt)
            zigzag(self.position, dt)
        end,
    })
end
