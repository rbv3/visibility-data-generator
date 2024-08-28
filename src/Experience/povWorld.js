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

        this.gui = this.experience.gui
        
        this.locations = []
        this.maxLocations = 1
        this.currentLocationIndex = {
            value: 0
        }

        this.setGUI()
    }
    initScene(scene) {
        const timesSmaller = 7;
        
        // clone of initial experience scene after loading all models
        this.scene = scene.clone()

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
    updateViewPort(result) {
        this.locations = result
        this.updateCamera(0)
    }
    updateCamera(index) {
        // update position
        const location = this.locations[index]

        const residual = location.residual
        const steps = location.steps

        this.updateHTML(residual, steps)

        this.camera.position.set(
            location.x,
            location.y,
            location.z,
        )
        this.camera.rotation.set(
            THREE.MathUtils.degToRad(location.xh),
            THREE.MathUtils.degToRad(location.yh),
            THREE.MathUtils.degToRad(location.zh),
        )
        this.camera.updateProjectionMatrix()
        this.updateSceneOnce()
    }
    updateHTML(residual, steps) {
        document.getElementById("webgl-pov-steps").textContent=`Steps: ${steps}` ;
        document.getElementById("webgl-pov-residual").textContent=`Residual: ${residual}`;
    }
    updateSceneOnce() {
        this.renderer.render(this.scene, this.camera)
    }
    setGUI() {
        this.gui.viewportFolder.add(
            this.currentLocationIndex, 'value'
        )
        .min(0)
        .max(this.maxLocations - 1)
        .step(1)
        .name('Position Index')
        .updateDisplay()
        .onFinishChange((index) => {
            this.updateCamera(index)
            this.experience.particleHelper.updateParticleColorAtIndex(index)
        })
    }
}