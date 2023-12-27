import Experience from './Experience.js'
import WebGPU from 'three/addons/capabilities/WebGPU.js'
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js'

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.setInstance()
    }

    setInstance() {
        if ( WebGPU.isAvailable() === false ) {

            document.body.appendChild( WebGPU.getErrorMessage() )

            throw new Error( 'No WebGPU support' )
        } else {
            console.log('Using WebGPU')
        }
        this.instance = new WebGPURenderer({
            canvas: this.canvas,
            antialias: true,
        })
        this.instance.setClearColor('#000000')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }
    update() {
        this.instance.render(this.scene, this.camera.instance)
    }
}