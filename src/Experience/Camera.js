import * as THREE from 'three'
import Experience from './Experience.js'
import { CustomPointerLockControls } from './CustomPointerLockControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.gui = this.experience.gui
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setControls()

        // this.setGUI()
    }
    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width/this.sizes.height,
            0.1,
            2500
        )
        this.instance.position.set(1300, 100, 1500)
        // face loading plane
        this.instance.quaternion.set(0, 0.2, 0, 1)
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
        this.gui.instance.add(this.instance.position, 'x').min(0).max(2000).step(1)
        this.gui.instance.add(this.instance.position, 'y').min(0).max(2000).step(1)
        this.gui.instance.add(this.instance.position, 'z').min(-100).max(2000).step(1)
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    update() {
    }
}