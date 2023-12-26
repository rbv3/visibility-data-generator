import * as THREE from 'three'
import Experience from './Experience'

export default class Lights {
    constructor() {
        this.experience = new Experience()
        this.gui = this.experience.gui
        // this.directionalLight = new THREE.DirectionalLight('#ffffff', 0.5)
        // this.directionalLight.position.set(3.5, 2, - 1.25)

        this.ambientLight = new THREE.AmbientLight('#ffffff', 1)
        this.ambientLight.castShadow = false

        this.setGUI()
    }
    setGUI() {
        // this.gui.instance.add(this.directionalLight, 'intensity').min(0).max(3).step(0.001).name('directionalLight Intensity')
        this.gui.instance.add(this.ambientLight, 'intensity').min(0).max(1).step(0.001).name('ambientLight intensity')
    }
}