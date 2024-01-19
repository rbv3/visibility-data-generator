export const increaseMapFrequency = (key, map) => {
    if(key in map) {
        map[key] += 1
    } else {
        map[key] = 1
    }
}
export const roundColor = (color) => {
    let roundedColor = [0, 0, 0]
    for(let i=0; i<color.length; i++) {
        if(color[i] > 100) {
            roundedColor[i] = 255
        } else {
            roundedColor[i] = 0
        }
    }
    return roundedColor
}

export const isGreyColor = (color) => {
    return color[0] == color[1] && color[0] == color[2]
}

export const hydrateMap = (key, map) => {
    if(key in map) {
        map[key]++
    } else {
        map[key] = 1
    }
}

export const float32Flatten = (chunks) => {
    const result = []
    chunks.forEach((chunk)=> {
        for(let i = 0; i < chunk.length; i += 3) {
            result.push([
                chunk[i],
                chunk[i+1],
                chunk[i+2]
            ])
        }
    })

    return result
}

export const getDistance = (pointA, pointB) => {
    const deltaX = pointA[0] - pointB[0]
    const deltaY = pointA[1] - pointB[1]
    // const deltaZ = pointA[2] - pointB[2] // height

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
}