import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import gsap from 'gsap'
import Experience from '../Experience'


export default class Loaders {
    constructor() {
        this.experience = new Experience
        
        this.setLoadingManager()
        this.gltfLoader = new GLTFLoader(this.loadingManager)
        this.setDracoLoader()
    }
    setLoadingManager() {
        const loadingBarElement = document.querySelector('.loading-bar')
        this.loadingPlane = this.experience.loadingPlane

        this.loadingManager = new THREE.LoadingManager(
            () => {
                gsap.delayedCall(0.5, () => {
                    gsap.to(
                        this.loadingPlane.instance.material.uniforms.uAlpha,
                        {
                            duration: 2,
                            value: 0
                        }
                    )
                    loadingBarElement.classList.add('loading-bar--ended')
                    loadingBarElement.style.transform = ''
                    this.loadingPlane.dispose()
                })
            },
            (_, itemsLoaded, itemsTotal) => {
                const progressRatio = itemsLoaded / itemsTotal
                loadingBarElement.style.transform = `scaleX(${progressRatio})`
            }
        )
    }
    setDracoLoader() {
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('/draco/')

        this.gltfLoader.setDRACOLoader(this.dracoLoader)
    }
}
