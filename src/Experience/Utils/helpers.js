import * as YUKA from 'yuka'
import * as THREE from 'three'

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
    const deltaZ = pointA[2] - pointB[2]

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2))
}
export const getDistance3D = (pointA, pointB) => {
    const deltaX = pointA[0] - pointB[0]
    const deltaY = pointA[1] - pointB[1]
    const deltaZ = pointA[2] - pointB[2]

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2) + Math.pow(deltaZ, 2))
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

export const updateChildrenMaterial = (object3d, material) => {
    object3d?.children.forEach(c => {
        c.material = material
    })
}

export const createConvexHullHelper = ( convexHull ) => {

    const faces = convexHull.faces

    var positions = []
    var colors = []
    var centroids = []

    const color = new THREE.Color()

    for ( let i = 0; i < faces.length; i ++ ) {

        const face = faces[ i ]
        const centroid = face.centroid
        let edge = face.edge
        const edges = []

        color.setHex( Math.random() * 0xffffff )

        centroids.push( centroid.x, centroid.y, centroid.z )

        do {

            edges.push( edge )

            edge = edge.next

        } while ( edge !== face.edge )

        // triangulate

        const triangleCount = ( edges.length - 2 )

        for ( let i = 1, l = triangleCount; i <= l; i ++ ) {

            const v1 = edges[ 0 ].vertex
            const v2 = edges[ i + 0 ].vertex
            const v3 = edges[ i + 1 ].vertex

            positions.push( v1.x, v1.y, v1.z )
            positions.push( v2.x, v2.y, v2.z )
            positions.push( v3.x, v3.y, v3.z )

            colors.push( color.r, color.g, color.b )
            colors.push( color.r, color.g, color.b )
            colors.push( color.r, color.g, color.b )

        }

    }

    // convex hull

    const convexGeometry = new THREE.BufferGeometry()
    convexGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) )
    convexGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) )

    const convexMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    const mesh = new THREE.Mesh( convexGeometry, convexMaterial )

    // centroids (useful for debugging)

    // const centroidGeometry = new THREE.BufferGeometry();
    // centroidGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( centroids, 3 ) );

    // const centroidMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 0.25 } );
    // const pointCloud = new THREE.Points( centroidGeometry, centroidMaterial );

    // mesh.add( pointCloud );

    //

    return mesh

}

export const createOBBHelper = ( obb ) => {

    const center = obb.center
    const size = new YUKA.Vector3().copy( obb.halfSizes ).multiplyScalar( 2 )
    const rotation = new YUKA.Quaternion().fromMatrix3( obb.rotation )

    const geometry = new THREE.BoxGeometry( size.x, size.y, size.z )
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    const mesh = new THREE.Mesh( geometry, material )

    mesh.position.copy( center )
    mesh.quaternion.copy( rotation )

    return mesh

}

export const createArrayOfPointsFromGroup = (group) => {
    const points = []
    group.children.forEach(child => {
        const geometry = child.geometry.toNonIndexed()
        const position = geometry.getAttribute( 'position' )
        for ( let i = 0; i < position.array.length; i += 3 ) {
            let index = i / 3

            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute( position, index )
            child.localToWorld( vertex )
    
            points.push( new YUKA.Vector3( ...vertex ) )
    
        }
    })
    return points
}