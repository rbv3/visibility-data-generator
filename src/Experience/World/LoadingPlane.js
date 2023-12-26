import * as THREE from 'three'
import loadingPlaneVertexShader from '../Shaders/LoadingPlane/vertexShader.glsl'
import loadingPlaneFragmentShader from '../Shaders/LoadingPlane/fragmentShader.glsl'
import Experience from '../Experience'

export default class LoadingPlane {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.setPlane()
    }
    setPlane() {
        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uAlpha: { value: 1 }
            },
            vertexShader: loadingPlaneVertexShader,
            fragmentShader: loadingPlaneFragmentShader
        })
        this.instance = new THREE.Mesh(this.geometry, this.material)
        this.instance.position.set(0, 0, 1)
        this.scene.add(this.instance)
    }
    dispose() {
        this.material.dispose()
        this.geometry.dispose()
        this.scene.remove(this.instance)
    }
}