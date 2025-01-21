local Random = {}

function Random.randomFloat(min, max)
    return min + math.random() * (max - min)
end

return Random
