--- Movement patterns module for objects with position and onTick updates

local MovementPatterns = {}

-- Linear movement to a target position at a specific speed
function MovementPatterns.linearMove(targetPos, speed)
    return function(obj, dt)
        local dx, dy, dz = targetPos.x - obj.x, targetPos.y - obj.y, targetPos.z - obj.z
        local distance = math.sqrt(dx * dx + dy * dy + dz * dz)

        if distance < speed * dt then
            obj.x, obj.y, obj.z = targetPos.x, targetPos.y, targetPos.z
            return true -- Movement completed
        else
            local factor = (speed * dt) / distance
            obj.x = obj.x + dx * factor
            obj.y = obj.y + dy * factor
            obj.z = obj.z + dz * factor
            return false -- Movement ongoing
        end
    end
end

-- Jumping movement with a specific height and duration
function MovementPatterns.jump(height, duration)
    local elapsedTime = 0
    return function(obj, dt)
        elapsedTime = elapsedTime + dt
        local t = elapsedTime / duration

        if t >= 1 then
            -- TODO: feels wrong, is this correct?
            obj.y = obj.y - height
            return true                                 -- Jump completed
        else
            local jumpOffset = height * 4 * t * (1 - t) -- Parabolic jump formula
            obj.y = obj.y + jumpOffset - height * (4 * (t - dt / duration) * (1 - (t - dt / duration)))
            return false                                -- Jump ongoing
        end
    end
end

-- Random movement within a specified range and speed
function MovementPatterns.randomMove(range, speed)
    local target = {
        -- TODO: custom random that accepts and returns floats?
        x = math.random(-range, range),
        y = math.random(-range, range),
        z = math.random(-range, range)
    }

    return function(obj, dt)
        return MovementPatterns.linearMove(target, speed)(obj, dt)
    end
end

-- Oscillate along a given direction (x, y, z) with amplitude and frequency
function MovementPatterns.oscillate(direction, amplitude, frequency)
    local time = 0
    return function(obj, dt)
        time = time + dt
        local offset = amplitude * math.sin(2 * math.pi * frequency * time)
        obj.x = obj.x + direction.x * offset - direction.x * amplitude * math.sin(2 * math.pi * frequency * (time - dt))
        obj.y = obj.y + direction.y * offset - direction.y * amplitude * math.sin(2 * math.pi * frequency * (time - dt))
        obj.z = obj.z + direction.z * offset - direction.z * amplitude * math.sin(2 * math.pi * frequency * (time - dt))
        return false -- Always ongoing
    end
end

-- Hovering movement along the Y-axis with amplitude and frequency
function MovementPatterns.hover(amplitude, frequency)
    return MovementPatterns.oscillate({ x = 0, y = 1, z = 0 }, amplitude, frequency)
end

-- Circular rotation around a pivot point on the XZ plane
function MovementPatterns.rotate(pivot, radius, angularSpeed)
    local angle = 0
    return function(obj, dt)
        angle = angle + angularSpeed * dt
        obj.x = pivot.x + radius * math.cos(angle)
        obj.z = pivot.z + radius * math.sin(angle)
        return false -- Always ongoing
    end
end

-- Zig-zag movement along a direction with zig size and speed
function MovementPatterns.zigzag(direction, zigSize, zigSpeed)
    local time = 0
    return function(obj, dt)
        time = time + dt
        local factor = math.floor(time * zigSpeed) % 2 == 0 and 1 or -1
        obj.x = obj.x + direction.x * zigSize * factor * dt
        obj.y = obj.y + direction.y * zigSize * factor * dt
        obj.z = obj.z + direction.z * zigSize * factor * dt
        return false -- Always ongoing
    end
end

-- Damping modifier that reduces speed over time
function MovementPatterns.damp(initialSpeed, dampingFactor)
    local speed = initialSpeed
    return function(obj, dt)
        if speed <= 0 then
            return true -- Movement completed
        end
        speed = speed - dampingFactor * dt
        obj.x = obj.x + obj.vx * dt
        obj.y = obj.y + obj.vy * dt
        obj.z = obj.z + obj.vz * dt
        return false -- Movement ongoing
    end
end

-- Spiral movement along the Y-axis with radius and angular speed
function MovementPatterns.spiral(pivot, radius, angularSpeed, verticalSpeed)
    local angle = 0
    local height = 0
    return function(obj, dt)
        angle = angle + angularSpeed * dt
        height = height + verticalSpeed * dt
        obj.x = pivot.x + radius * math.cos(angle)
        obj.z = pivot.z + radius * math.sin(angle)
        obj.y = pivot.y + height
        return false -- Always ongoing
    end
end

-- Move along a path defined by a sequence of waypoints
function MovementPatterns.followPath(waypoints, speed)
    local currentIndex = 1
    return function(obj, dt)
        if currentIndex > #waypoints then
            return true -- Path completed
        end

        local targetPos = waypoints[currentIndex]
        local dx, dy, dz = targetPos.x - obj.x, targetPos.y - obj.y, targetPos.z - obj.z
        local distance = math.sqrt(dx * dx + dy * dy + dz * dz)

        if distance < speed * dt then
            obj.x, obj.y, obj.z = targetPos.x, targetPos.y, targetPos.z
            currentIndex = currentIndex + 1
        else
            local factor = (speed * dt) / distance
            obj.x = obj.x + dx * factor
            obj.y = obj.y + dy * factor
            obj.z = obj.z + dz * factor
        end
        return false -- Path ongoing
    end
end

-- Combine multiple movement patterns to run simultaneously
function MovementPatterns.combine(movements)
    return function(obj, dt)
        local completed = true
        for _, move in ipairs(movements) do
            if move(obj, dt) then
                return true
            end
        end
        return false
    end
end

-- Chain multiple movement patterns to run sequentially
function MovementPatterns.chain(movements)
    local current = 1
    return function(obj, dt)
        if current > #movements then
            return true -- All movements completed
        end

        if movements[current](obj, dt) then
            current = current + 1
        end

        return false -- Chain ongoing
    end
end
