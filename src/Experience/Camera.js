import * as THREE from 'three'
import Experience from './Experience.js'
import { CustomPointerLockControls } from './CustomPointerLockControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CAMERA_QUATERNIONS } from './Utils/constants.js'


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
        this.instance.position.set(512, 100, 280)
        // this.instance.position.set(0, 100, 0)
        this.instance.lookAt(733, 55, 714) // random point on the lake

        // this.instance.position.set(337.87109375, -11.231389999389648,  -59.07550048828125)
        

        this.instance.quaternion.set(0, 0.2, 0, 1)
        this.instance.quaternion.set(...CAMERA_QUATERNIONS[this.quaternionIndex])
        this.scene.add(this.instance)
    }
    setControls() {
        this.controls = new CustomPointerLockControls(this.instance, this.canvas)
        this.controls.isLocked = true
    }
    setGUI() {
        this.gui.cameraFolder.add({getCameraPosition : () => {
            console.log(this.instance.position)
        }}, 'getCameraPosition')
        this.gui.cameraFolder.add({getCameraRotation : () => {
            console.log(
                THREE.MathUtils.radToDeg(this.instance.rotation._x),
                THREE.MathUtils.radToDeg(this.instance.rotation._y),
                THREE.MathUtils.radToDeg(this.instance.rotation._z),
            )
        }}, 'getCameraRotation')
        this.gui.cameraFolder.add({getCamera : () => {
            console.log(this.instance)
        }}, 'getCamera')
        
        this.gui.cameraFolder.add(this.instance, 'far').min(100).max(10000).onFinishChange(() => this.instance.updateProjectionMatrix())
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