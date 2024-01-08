import * as THREE from 'three'
import Experience from './Experience.js'
import { CustomPointerLockControls } from './CustomPointerLockControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CAMERA_QUATERNIONS, ENDING_FLOOR_BUILDING_POSITION } from './Utils/constants.js'


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.gui = this.experience.gui
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas


        this.quaternionIndex = 0

        this.setInstance()
        this.setControls()

        this.setGUI()
    }
    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width/this.sizes.height,
            1,
            2500
        )
        // this.instance.position.set(1300, 100, 1500)
        this.instance.position.set(...ENDING_FLOOR_BUILDING_POSITION)

        this.instance.quaternion.set(0, 0.2, 0, 1)
        this.instance.quaternion.set(...CAMERA_QUATERNIONS[this.quaternionIndex])
        this.scene.add(this.instance)
    }
    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)

        this.controls.enableDamping = true
        this.controls.rotateSpeed = 0.1
        this.controls.zoomSpeed = 0.5
        this.controls.panSpeed = 0.1
    }
    setControls() {
        this.controls = new CustomPointerLockControls(this.instance, this.canvas)
        this.controls.isLocked = true
    }
    setGUI() {
        this.gui.instance.add({updateQuaternion : () => {
            this.updateQuaternion()
        }}, 'updateQuaternion')
    }
    updateQuaternion() {
        this.quaternionIndex += 1
        this.quaternionIndex %= CAMERA_QUATERNIONS.length
        this.instance.quaternion.set(...CAMERA_QUATERNIONS[this.quaternionIndex])
    }

    createSnapshotPositions() {
        // get differente between start and ending positions
        // divide the diff by X (prolly 10)
        // create a array that goes from start to the end by moving delta/X each time 
    }

    updatePosition() {
        // iterate through snapshotPositions
    }
    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    update() {
    }
}