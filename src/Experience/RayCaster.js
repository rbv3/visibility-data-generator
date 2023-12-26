import * as THREE from 'three'
import Experience from './Experience'

export default class RayCaster {
    constructor() {
        this.instance = new THREE.Raycaster()

        this.experience = new Experience()
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        this.buildingsMeshes = this.experience.buildingsMeshes
        this.mouse = new THREE.Vector2()

        window.addEventListener('mousemove', (_event) => {
            this.mouse.x = (_event.clientX / this.sizes.width) * 2 - 1
            this.mouse.y = - (_event.clientY / this.sizes.height) * 2 + 1
        })
    }
    update() {
        this.instance.setFromCamera(this.mouse, this.camera.instance)
        // const intersects = this.instance.intersectObjects(this.buildingsMeshes)
        // console.log(intersects[0]);
        // console.log(intersects[0]?.faceIndex);
    }
}