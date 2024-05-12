import * as THREE from 'three'
import Experience from "./Experience"

import { WebGLRenderer } from 'three'
import { CAMERA_QUATERNIONS, REAL_WORLD_OBJECT_TO_COLOR } from "./Utils/constants"

const startClearColor = REAL_WORLD_OBJECT_TO_COLOR['sky']
export default class PovWorld {
    constructor() {
        this.experience = new Experience()

        this.camera = null
        this.scene = null
        this.sizes = this.experience.sizes
    }
    initScene(scene) {
        // copy of initial experience scene after loading all models
        const timesSmaller = 7;
        this.scene = scene
        this.initCamera()

        this.renderer = new WebGLRenderer({
            canvas: document.querySelector('canvas.webgl-pov')
        })
        this.renderer.setClearColor(startClearColor)
        this.renderer.setSize(this.sizes.width / timesSmaller, this.sizes.height / timesSmaller)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)

        this.updateSceneOnce()
    }
    changePOV(pov) {
        this.initCamera(pov.cameraSettings)
        this.updateSceneOnce()
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            1,
            2500
        )
        this.camera.position.set(512, 100, 280)
        // this.instance.position.set(0, 100, 0)
        this.camera.lookAt(733, 55, 714) // random point on the lake

        // this.instance.position.set(337.87109375, -11.231389999389648,  -59.07550048828125)

        this.scene.add(this.camera)
    }
    updateCamera() {
        const mockResult = {
            x: 680.347899243,
            xh: -147.7311064059,
            y: 57.1941489662,
            yh: -39.0195297749,
            z: 578.882451719,
            zh: -163.2008019361,
        }
        // update position
        this.camera.position.set(
            mockResult.x,
            mockResult.y,
            mockResult.z,
        )
        this.camera.rotation.set(
            mockResult.xh,
            mockResult.yh,
            mockResult.zh,

        )
        this.camera.updateProjectionMatrix()
        this.updateSceneOnce()
    }
    updateSceneOnce() {
        this.renderer.render(this.scene, this.camera)
    }
}