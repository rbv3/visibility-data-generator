import * as THREE from 'three'
import Experience from './Experience'

export default class Lights {
    constructor() {
        this.experience = new Experience()

        this.gui = this.experience.gui.lightsFolder
        this.directionalLightA = new THREE.DirectionalLight('#ffffff', 0.8)
        this.directionalLightA.position.set(3.5, 2, - 1.25)
        this.directionalLightB = new THREE.DirectionalLight('#ffffff', 0.8)
        this.directionalLightB.position.set(-1.25, 2, 3.5)
        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.6)
        this.ambientLight.castShadow = false

        this.setGUI()
    }

    setDirectionalLight(isEnabled) {
        if(isEnabled) {
            this.directionalLightA.intensity = 0.8
            this.directionalLightB.intensity = 0.8
        } else {
            this.directionalLightA.intensity = 0
            this.directionalLightB.intensity = 0
        }
    }

    setGUI() {
        this.gui.add(this.directionalLightA, 'intensity').min(0).max(3).name('directionalA intensity')
        this.gui.add(this.directionalLightB, 'intensity').min(0).max(3).name('directionalB intensity')
        this.gui.add(this.ambientLight, 'intensity').min(0).max(3).name('ambient intensity')
    }
}