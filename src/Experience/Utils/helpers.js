import * as YUKA from 'yuka'
import * as THREE from 'three'

import { BUILDING_OBJECT_TO_COLOR, OBJECT_TO_COLOR, VIEW_MODES } from './constants'

export const increaseMapFrequency = (key, map) => {
    if (key in map) {
        map[key] += 1
    } else {
        map[key] = 1
    }
}
export const roundColor = (color) => {
    let roundedColor = [0, 0, 0]
    for (let i = 0; i < color.length; i++) {
        if (color[i] > 100) {
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
    if (key in map) {
        map[key]++
    } else {
        map[key] = 1
    }
}

export const getVertex = (position, index) => {
    const i3 = index * 3
    return [
        position[i3 + 0],
        position[i3 + 1],
        position[i3 + 2],
    ]
}

export const subtractVectors = (vec1, vec2) => {
    return [
        vec1[0] - vec2[0],
        vec1[1] - vec2[1],
        vec1[2] - vec2[2],
    ]
}

export const normalizeGoal = (goal) => {
    let sum = 0
    goal.forEach(val => sum += val)

    return goal.map(val => val / sum)
}

export const float32Flatten = (chunks) => {
    const result = []
    chunks.forEach((chunk) => {
        for (let i = 0; i < chunk.length; i += 3) {
            result.push([
                chunk[i],
                chunk[i + 1],
                chunk[i + 2]
            ])
        }
    })

    return result
}

export const getDistance = (pointA, pointB) => {
    const deltaX = pointA[0] - pointB[0]
    const deltaZ = pointA[2] - pointB[2]

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2))
}
export const getDistance3D = (pointA, pointB) => {
    const deltaX = pointA[0] - pointB[0]
    const deltaY = pointA[1] - pointB[1]
    const deltaZ = pointA[2] - pointB[2]

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2) + Math.pow(deltaZ, 2))
}
export const normalize3DCoord = (coord) => {
    const magnitude = Math.sqrt(Math.pow(coord[0], 2) + Math.pow(coord[1], 2) + Math.pow(coord[2], 2))
    return [
        coord[0] / magnitude,
        coord[1] / magnitude,
        coord[2] / magnitude,
    ]
}

export const download_csv = (data, fileName) => {
    var csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    var csvURL = null
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

export const createCsvColor = (colorMap, mode = VIEW_MODES.visibility) => {
    let csvColorLine = '['
    if(mode == VIEW_MODES.visibility) {
        csvColorLine += checkMapValue(colorMap, 'building', mode)
        csvColorLine += checkMapValue(colorMap, 'water', mode)
        csvColorLine += checkMapValue(colorMap, 'road', mode)
        csvColorLine += checkMapValue(colorMap, 'sidewalk', mode)
        csvColorLine += checkMapValue(colorMap, 'surface', mode)
        csvColorLine += checkMapValue(colorMap, 'tree', mode)
        csvColorLine += checkMapValue(colorMap, 'sky', mode)
        csvColorLine += checkMapValue(colorMap, 'miscelaneous', mode)
        csvColorLine = csvColorLine.slice(0, -1)
    }
    if(mode == VIEW_MODES.buildingData) {
        csvColorLine += checkMapValue(colorMap, 'brick', mode)
        csvColorLine += checkMapValue(colorMap, 'concrete', mode)
        csvColorLine += checkMapValue(colorMap, 'marble', mode)
        csvColorLine += checkMapValue(colorMap, 'plaster', mode)
        csvColorLine += checkMapValue(colorMap, 'metal', mode)
        csvColorLine += checkMapValue(colorMap, 'miscelaneous', mode)
        csvColorLine = csvColorLine.slice(0, -1)
    }
    csvColorLine += ']'
    console.log(csvColorLine);
    return csvColorLine
}
const checkMapValue = (map, key, mode) => {
    if (mode == VIEW_MODES.buildingData) {
        if (BUILDING_OBJECT_TO_COLOR[key] in map) {
            return `${map[BUILDING_OBJECT_TO_COLOR[key]]},`
        }
    }
    if (mode == VIEW_MODES.visibility) {
        if (OBJECT_TO_COLOR[key] in map) {
            return `${map[OBJECT_TO_COLOR[key]]},`
        }
    }
    return '0,'

}

export const updateChildrenMaterial = (object3d, material) => {
    object3d?.children.forEach(c => {
        c.material = material
    })
}

export const createConvexHullHelper = (convexHull) => {

    const faces = convexHull.faces

    var positions = []
    var colors = []
    var centroids = []

    const color = new THREE.Color()

    for (let i = 0; i < faces.length; i++) {

        const face = faces[i]
        const centroid = face.centroid
        let edge = face.edge
        const edges = []

        color.setHex(Math.random() * 0xffffff)

        centroids.push(centroid.x, centroid.y, centroid.z)

        do {

            edges.push(edge)

            edge = edge.next

        } while (edge !== face.edge)

        // triangulate

        const triangleCount = (edges.length - 2)

        for (let i = 1, l = triangleCount; i <= l; i++) {

            const v1 = edges[0].vertex
            const v2 = edges[i + 0].vertex
            const v3 = edges[i + 1].vertex

            positions.push(v1.x, v1.y, v1.z)
            positions.push(v2.x, v2.y, v2.z)
            positions.push(v3.x, v3.y, v3.z)

            colors.push(color.r, color.g, color.b)
            colors.push(color.r, color.g, color.b)
            colors.push(color.r, color.g, color.b)

        }

    }

    // convex hull

    const convexGeometry = new THREE.BufferGeometry()
    convexGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    convexGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const convexMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    const mesh = new THREE.Mesh(convexGeometry, convexMaterial)

    // centroids (useful for debugging)

    // const centroidGeometry = new THREE.BufferGeometry();
    // centroidGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( centroids, 3 ) );

    // const centroidMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 0.25 } );
    // const pointCloud = new THREE.Points( centroidGeometry, centroidMaterial );

    // mesh.add( pointCloud );

    //

    return mesh

}

export const createOBBHelper = (obb) => {

    const center = obb.center
    const size = new YUKA.Vector3().copy(obb.halfSizes).multiplyScalar(2)
    const rotation = new YUKA.Quaternion().fromMatrix3(obb.rotation)

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.copy(center)
    mesh.quaternion.copy(rotation)

    return mesh

}

export const createArrayOfPointsFromGroup = (group) => {
    const points = []
    console.log({group})
    group.children.forEach(child => {
        const geometry = child.geometry.toNonIndexed()
        const position = geometry.getAttribute('position')
        for (let i = 0; i < position.array.length; i += 3) {
            let index = i / 3
            console.log({position})

            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute(position, index)
            child.localToWorld(vertex)
            // console.log({child})
            console.log({vertex}, {index})

            points.push(new YUKA.Vector3(...vertex))

        }
    })
    return points
}

export const pxStringToInt = (string) => {
    return Number(string.split("px")[0])
}