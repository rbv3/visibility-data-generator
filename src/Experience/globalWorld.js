import * as THREE from 'three'
import JEASINGS from 'jeasings'

import Experience from "./Experience"

import { WebGLRenderer } from 'three'
import { CAMERA_QUATERNIONS, REAL_WORLD_OBJECT_TO_COLOR } from "./Utils/constants"

const startClearColor = REAL_WORLD_OBJECT_TO_COLOR['sky']
export default class GlobalWorld {
    constructor(index) {
        this.index = index;

        this.experience = new Experience()


        this.camera = null
        this.scene = null
        this.sizes = this.experience.sizes

        this.gui = this.experience.gui

        this.locations = []
        this.maxLocations = 1
        this.currentLocationIndex = {
            value: this.index
        }

        // this.canvas = document.querySelector(`.webgl-global${this.index}`);
        this.topCamera   = {"x": 1230, "y":5295, "z":365, "xh":-1.6, "yh":-0.05, "zh":-1.7}
        // this.birdCamera  = {"x": 1400, "y":3000, "z":-4275, "xh":THREE.MathUtils.degToRad(-150), "yh":THREE.MathUtils.degToRad(0), "zh":THREE.MathUtils.degToRad(-180)}
        this.birdCamera  = {"x": 1400, "y":2500, "z":-2800, "xh":THREE.MathUtils.degToRad(-150), "yh":THREE.MathUtils.degToRad(0), "zh":THREE.MathUtils.degToRad(-180)}
        // this.frontCamera = {"x": -2500, "y":1730, "z":200, "xh":THREE.MathUtils.degToRad(-100), "yh":THREE.MathUtils.degToRad(-70), "zh":THREE.MathUtils.degToRad(-110)}
        this.frontCamera = {"x": -2410, "y":1140, "z":250, "xh":THREE.MathUtils.degToRad(-135), "yh":THREE.MathUtils.degToRad(-75), "zh":THREE.MathUtils.degToRad(-130)}
        // this.frontCamera = {"x": -2000, "y":2100, "z":180, "xh":THREE.MathUtils.degToRad(-110), "yh":THREE.MathUtils.degToRad(-50), "zh":THREE.MathUtils.degToRad(-110)}

        this.globalCameras = [this.topCamera, this.frontCamera, this.birdCamera]

        

        this.canvas = document.querySelector(`.webgl-global${this.index}`);
        this.animationDuration = 750

        this.canvas.addEventListener('click', () => {
            this.animateCameraMovement(this.experience.camera.instance, true);
        })

    }
    initScene(scene) {
        // clone of initial experience scene after loading all models
        this.scene = scene//.clone()
        this.initCamera(this.index)

        this.renderer = new WebGLRenderer({
            canvas: this.canvas 
        })
        this.renderer.setClearColor(startClearColor)
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)

        // this.updateSceneOnce()
        // this.updateCamera(this.index)  
        this.animateCameraMovement(this.camera, false)     
        this.updateSceneOnce()

    }

    animateCameraMovement(camera, easing) {
        const cameraPosition = {
            x: this.globalCameras[this.index].x,
            y:this.globalCameras[this.index].y,
            z:this.globalCameras[this.index].z,
        }
        const cameraRotation = {
            x: this.globalCameras[this.index].xh, 
            y: this.globalCameras[this.index].yh, 
            z: this.globalCameras[this.index].zh
        }
        const cameraFar = 6000

        if (easing == true){
            //Does not seem to work for the global world canvases
            new JEASINGS.JEasing(camera.position)
                .to(
                    {
                        ...cameraPosition
                    },
                    500
                )
                .easing(JEASINGS.Cubic.Out)
                .start()
            new JEASINGS.JEasing(camera.rotation)
                    .to(
                        {
                            ...cameraRotation
                        },
                        500
                    )
                    .easing(JEASINGS.Cubic.Out)
                    .start()
        }
        else{
            camera.position.set(
                cameraPosition.x, cameraPosition.y, cameraPosition.z
            )
            camera.rotation.set(
                cameraRotation.x, cameraRotation.y, cameraRotation.z
            )
        }

        camera.far = cameraFar
        camera.updateProjectionMatrix()
    
    }




    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            1,
            2500
        )
        // random point on the lake
        this.camera.position.set(512, 100, 280)
        this.camera.lookAt(733, 55, 714) // random point on the lake

        this.scene.add(this.camera)
        
    }


    updateHTML(residual, steps) {
        document.getElementById("webgl-pov-steps").textContent = `Steps: ${steps}`;
        document.getElementById("webgl-pov-residual").textContent = `Residual: ${residual}`;
    }
    updateSceneOnce(){//scene) {
        // this.scene = scene
        this.renderer.render(this.scene, this.camera)
    }
}