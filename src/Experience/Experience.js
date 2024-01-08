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
import { COLOR_TO_OBJECT, OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR } from './Utils/constants.js'
import { increaseMapFrequency, roundColor } from './Utils/helpers.js'

let instance = null

export default class Experience {
    constructor(canvas) {
        // Singleton
        if(instance) {
            return instance
        }
        instance = this

        // Console access for debugging purpose
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

        this.setGUI()
    }
    setGUI() {
        this.gui.instance.add({countColorOfPixels : () => {
            this.countColorOfPixels()
        }}, 'countColorOfPixels')

        this.gui.instance.add({toggleVisibilityMode: () => this.toggleVisibilityMode()}, 'toggleVisibilityMode')
    }
    countColorOfPixels() {
        if(!this.world.isVisibility) {
            console.warn('This method should not be used on Real World Rendering')
            return
        }
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
            color = roundColor(color)

            if(!(color in COLOR_TO_OBJECT)) {
                increaseMapFrequency('miscelaneous', colorMap)

                continue
            }
            increaseMapFrequency(color, colorMap)
        }
        const totalPixels = readPixelBuffer.length / 4
        console.log('Camera position and quaternion:')
        console.log(this.camera.instance.position)
        console.log(this.camera.instance.quaternion)
        console.log('Visibility of canvas:')
        for(const color in colorMap) {
            if(color in COLOR_TO_OBJECT) {
                console.log(`${COLOR_TO_OBJECT[color]}: ${colorMap[color] * 100 / totalPixels}% | ${colorMap[color]} pixels`)
            } else {
                console.log(`${color}: ${colorMap[color] * 100 / totalPixels}% | ${colorMap[color]} pixels`)

            }
        }
    }

    toggleVisibilityMode() {
        const toggledIsVisibility = !this.world.isVisibility
        this.world.city.toggleMaterial()
        this.world.lights.toggleDirectionalLight()

        const clearColor = toggledIsVisibility? `rgb(${OBJECT_TO_COLOR['sky']})` : REAL_WORLD_OBJECT_TO_COLOR['sky']
        this.renderer.updateClearColor(clearColor)

        this.world.isVisibility = toggledIsVisibility
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