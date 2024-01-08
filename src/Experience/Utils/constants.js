import * as THREE from 'three'

export const MIN_HEIGHT = 10
export const MAX_HEIGHT = 500

export const AMORTIZE_SPEED_X = 1.0
export const AMORTIZE_SPEED_Y = 5.0
export const AMORTIZE_SPEED_Z = 1.0

export const KeyCode = {
    ARROW_UP :'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    Z: 'KeyZ',
    X: 'KeyX',
    W: 'KeyW',
    A: 'KeyA',
    S: 'KeyS',
    D: 'KeyD',
    ESC: 'Escape'
}

// Color Detection 
export const OBJECT_TO_COLOR = {
    'building': '255,0,0',
    'water': '0,0,255',
    'road': '0,255,255',
    'sidewalk': '255,255,0',
    'surface': '255,0,255',
    'tree':'0,255,0',
    'sky':'0,0,0',
}
export const COLOR_TO_OBJECT = {
    '255,0,0': 'building',
    '0,0,255': 'water',
    '0,255,255': 'road' ,
    '255,255,0': 'sidewalk',
    '255,0,255': 'surface',
    '0,255,0': 'tree',
    '0,0,0': 'sky',
}
// Real world look like rendering
export const REAL_WORLD_OBJECT_TO_COLOR = {
    'building': '#9c9b89',
    'water': '#4f759c',
    'road': '#7e7e7e',
    'sidewalk': '#848791',
    'surface': '#876645',
    'tree':'#2f663c',
    'sky':'#bce0df',
}
// Depth Color
export const DEPTH_SKY = '255, 0, 0'

// Camera Grid
export const INITIAL_FLOOR_BUILDING_POSITION = new THREE.Vector3(310, 45, 268)
export const ENDING_FLOOR_BUILDING_POSITION = new THREE.Vector3(348, 45, 204)

export const CAMERA_QUATERNIONS = [
    // front
    new THREE.Vector4(
        -0.007534356421990641,
        -0.8645907622571576,
        -0.012969834186012006,
        0.5022527557854521
    ),
    // left
    new THREE.Vector4(
        -0.011303683767284387,
        -0.493823204851973,
        -0.006420063330717134,
        0.8694651527633784
    ),
    // right
    new THREE.Vector4(
        -0.0007248579983432066,
        0.9958547474041749,
        0.00796700794279462,
        0.09060531683013229
    ),
    // down
    new THREE.Vector4(
        -0.07610121773373563,
        -0.8471770311086373,
        -0.12630575046404055,
        0.5104375965983629
    ),
]

// view modes
export const VIEW_MODES = {
    depth: 'depth',
    visibility: 'visibility',
    realWorld: 'realWorld'
}