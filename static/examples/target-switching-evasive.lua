local gameConfig = {
  roomSize = {x = 8, y = 4, z = 6}, -- set room size to be 8x5m at 2m height
  cameraPos = {x = 0, y = 0, z = 2}, -- set camera position at center, near the back wall
  bulletsPerMinute = 600, -- anything above activates rifle mode
  timer = 60, -- in seconds
}

local function randomFloat(min, max)
  return min + math.random() * (max - min)
end

local function spawnRandomTarget()
  spawnTarget({
      size = {radius = 0.09, height = 0.04},
      hp = 10,
      position = {
          x = randomFloat(-3.8, 3.8),
          y = randomFloat(-1.75, 1.5),
          z = randomFloat(-2.8, -0.5),
      },
      movement = {
        strategy = "linear",
        velocity = {x=0.9, y= 0.0, z= 0.0},
        boundingBox = {
          min = {x=-3.8, y=-1.75, z=-2.8},
          max = {x=3.8, y=1.5, z=-0.5},
        },
        changeDirectionChance = randomFloat(0.4, 0.8),
        changeDirectionCooldown = randomFloat(0.3, 0.7),
      },
      onDeath = spawnRandomTarget
  })
end

function setup() 
  return gameConfig
end

function onInit()
  -- Spawn 5 static targets at random positions
  for i = 1, 5 do
      spawnRandomTarget()
  end
end

return {
  setup = setup,
  onInit = onInit
}