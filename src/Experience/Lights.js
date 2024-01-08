import * as THREE from 'three'
import Experience from './Experience'

export default class Lights {
    constructor() {
        this.experience = new Experience()

        this.gui = this.experience.gui
        this.directionalLight = new THREE.DirectionalLight('#ffffff', 0.5)
        this.directionalLight.position.set(3.5, 2, - 1.25)
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1.5)
        this.ambientLight.castShadow = false
    }
    setDirectionalLight(isEnabled) {
        if(isEnabled) {
            this.directionalLight.intensity = 0.5
        } else {
            this.directionalLight.intensity = 0
        }
    }
}