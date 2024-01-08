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