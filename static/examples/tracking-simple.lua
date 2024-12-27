local gameConfig = {
  roomSize = {x = 8, y = 4, z = 6}, -- set room size to be 8x5m at 2m height
  cameraPos = {x = 0, y = 0, z = 2}, -- set camera position at center, near the back wall
  bulletsPerMinute = 600, -- anything above activates rifle mode
  timer = 60, -- in seconds
}

function setup() 
  return gameConfig
end

function onInit()
  spawnTarget({
      size = {radius = 0.06, height = 0.4},
      hp = 0, -- infinite hp = tracking scenario
      position = {
          x = 0,
          y = 0,
          z = -2
      },
      movement = {
        strategy = "linear",
        velocity = {x=1.75, y= 0.0, z= 0.0},
        boundingBox = {
          min = {x=-3.8, y=-1.75, z=-2.8},
          max = {x=3.8, y=1.5, z=-0.5},
        },
        changeDirectionChance = 0.0,
        changeDirectionCooldown = 1.0,
      },
  })
end

return {
  setup = setup,
  onInit = onInit
}