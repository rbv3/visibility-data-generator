import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import GUI from './Utils/GUI.js'
import RayCaster from './RayCaster.js'
import CharacterControls from './CharacterControls.js'
import Loaders from './Utils/Loaders.js'
import StatsMonitor from './Utils/StatsMonitor.js'

let instance = null

export default class Experience {
    constructor(canvas) {
        // Singleton
        if(instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        // Debug
        this.gui = new GUI()
        this.statsMonitor = new StatsMonitor()

        // Setup
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.characterControls = new CharacterControls()
        this.renderer = new Renderer()
        this.loaders = new Loaders()
        this.world = new World()
        this.buildingsMeshes = this.world.buildingsMeshes
        this.raycaster = new RayCaster()

        // Events
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time.on('tick', () => {
            this.update()
        })
    }
    countColorOfPixels() {
        const gl = this.renderer.instance.getContext()
        const readPixelBuffer = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer)

        const colorMap = {}
        for(let i = 0; i < readPixelBuffer.length; i += 4) {
            let color = [
                readPixelBuffer[i],
                readPixelBuffer[i + 1],
                readPixelBuffer[i + 2]
            ]
            color = this.roundColor(color)
            if(color in colorMap) {
                colorMap[color] += 1
            } else {
                colorMap[color] = 1
            }
        }
        const totalPixels = readPixelBuffer.length / 4
        console.log('Camera position and angle:')
        console.log(this.camera.instance.quaternion)
        console.log(this.camera.instance.rotation)
        console.log(this.camera.instance.position)
        console.log('Visibility of canvas:')
        for(const color in colorMap) {
            console.log(`${color}: ${colorMap[color] * 100 / totalPixels}% | ${colorMap[color]} pixels`)
        }
    }
    roundColor(color) {
        let roundedColor = [0, 0, 0]
        for(let i=0; i<color.length; i++) {
            if(color[i] > 100) {
                roundedColor[i] = 255
            } else {
                roundedColor[i] = 0
            }
        }
        return roundedColor
    }
    resize() {
        this.camera.resize()
        this.renderer.resize()
    }
    update() {
        this.statsMonitor.instance.begin()
		
        this.camera.update()
        this.renderer.update()
        this.raycaster.update()
        this.characterControls.update()

        this.statsMonitor.instance.end()
    }
    
}