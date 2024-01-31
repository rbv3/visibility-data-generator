import { OBJECT_TO_COLOR } from './constants'

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
    // const deltaY = pointA[1] - pointB[1] // height
    const deltaZ = pointA[2] - pointB[2]

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2))
}

export const download_csv = (data, fileName) => {
    var csvData = new Blob([data], {type: 'text/csv;charset=utf-8;'})
    var csvURL =  null
    if (navigator.msSaveBlob) {
        csvURL = navigator.msSaveBlob(csvData, `${fileName}.csv`)
    } else {
        csvURL = window.URL.createObjectURL(csvData)
    }

    var tempLink = document.createElement('a')
    tempLink.href = csvURL
    tempLink.setAttribute('download', `${fileName}.csv`)
    tempLink.click()
}

export const createCsvColor = (colorMap) => {
    let csvColorLine = '['
    console.log(colorMap)
    csvColorLine += checkMapValue(colorMap, 'building')
    csvColorLine += checkMapValue(colorMap, 'water')
    csvColorLine += checkMapValue(colorMap, 'road')
    csvColorLine += checkMapValue(colorMap, 'sidewalk')
    csvColorLine += checkMapValue(colorMap, 'surface')
    csvColorLine += checkMapValue(colorMap, 'tree')
    csvColorLine += checkMapValue(colorMap, 'sky')
    csvColorLine += checkMapValue(colorMap, 'miscelaneous')
    csvColorLine = csvColorLine.slice(0, -1)
    csvColorLine += ']'
    return csvColorLine
}
const checkMapValue = (map, key) => {
    if(OBJECT_TO_COLOR[key] in map) {
        return `${map[OBJECT_TO_COLOR[key]]},`
    }
    return '0,'

}