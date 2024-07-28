import Experience from "../Experience"
import * as THREE from 'three'

let instance = null

export default class BirdsEye {
    constructor() {
        // Singleton
        if(instance) {
            return instance
        }
        this.experience = new Experience()
        this.camera = this.experience.camera
    }

    setBirdsEyeCamera() {
        const cameraPosition = [
            1222.9460847744015,
            483.0482763224882,
            -4474.680415156037
        ]
        const cameraRotation = [
            THREE.MathUtils.degToRad(-174.4967106570212), 
            THREE.MathUtils.degToRad(-1.8555140622514954), 
            THREE.MathUtils.degToRad(-179.82125863104804)
        ]
        const cameraFar = 7500

        this.camera.instance.position.set(...cameraPosition)
        this.camera.instance.rotation.set(...cameraRotation)
        this.camera.instance.far = cameraFar
        this.camera.instance.updateProjectionMatrix()
    }
}
