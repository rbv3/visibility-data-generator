import { WebGLRenderer } from 'three'
import Experience from './Experience.js'
import { REAL_WORLD_OBJECT_TO_COLOR } from './Utils/constants.js'

const startClearColor = REAL_WORLD_OBJECT_TO_COLOR['sky']
export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene

        this.gui = this.experience.gui

        this.camera = this.experience.camera

        this.setInstance()
        this.setGUI()
    }

    setInstance() {
        this.instance = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true,
            logarithmicDepthBuffer: false
        })
        this.instance.setClearColor(startClearColor)
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }
    updateClearColor(color) {
        this.instance.setClearColor(color)
    }
    createImage(fileName) {

        const url = this.instance.domElement.toDataURL()

        const link = document.createElement('a')

        link.setAttribute('href', url)
        link.setAttribute('target', '_blank')
        link.setAttribute('download', fileName)

        link.click()
    }

    setGUI() {
        this.gui.instance.add({screenshot: () => {
            const randomName = (Math.random() + 1).toString(36).substring(7)
            this.createImage(randomName)
        }}, 'screenshot')
    }

    update() {
        this.instance.render(this.scene, this.camera.instance)
    }
}