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
import { COLOR_TO_OBJECT, DEPTH_SKY, OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR, VIEW_MODES } from './Utils/constants.js'
import { increaseMapFrequency, isGreyColor, roundColor } from './Utils/helpers.js'

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

        this.currentMode = VIEW_MODES['realWorld']

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
        this.gui.instance.add({
            enableDepthMode : () => {
                this.enableDepthMode()
            }}, 'enableDepthMode')
        this.gui.instance.add({
            enableVisibilityMode : () => {
                this.enableVisibilityMode()
            }}, 'enableVisibilityMode')
        this.gui.instance.add({
            enableRealWorldMode : () => {
                this.enableRealWorldMode()
            }}, 'enableRealWorldMode')
        this.gui.instance.add({
            countColorOfPixels : () => {
                this.countColorOfPixels()
            }}, 'countColorOfPixels')
    }
    countColorOfPixels() {
        if(this.currentMode == VIEW_MODES['realWorld']) {
            console.warn('This method should not be used on Real World Rendering')
            return
        }
        const gl = this.renderer.instance.getContext()
        const readPixelBuffer = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer)
        
        if(this.currentMode == VIEW_MODES['visibility']) {
            this.countColorVisiblityMode(readPixelBuffer)
            return
        }
        if(this.currentMode == VIEW_MODES['depth']) {
            this.countColorDepthMode(readPixelBuffer)
            return
        }

        console.warn('unexpected view mode')
    }
    countColorVisiblityMode(readPixelBuffer) {
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
    countColorDepthMode(readPixelBuffer) {
        console.log('COLOR DEPTH MODE')
        const colorMap = {}
        let totalGreyPixel = 0
        let sumGreyColor = 0
        for(let i = 0; i < readPixelBuffer.length; i += 4) {
            let color = [
                readPixelBuffer[i],
                readPixelBuffer[i + 1],
                readPixelBuffer[i + 2]
            ]
            if(isGreyColor(color)) {
                increaseMapFrequency(color, colorMap)
                sumGreyColor += color[0]
                totalGreyPixel += 1
            }
        }
        console.log('Camera position and quaternion:')
        console.log(this.camera.instance.position)
        console.log(this.camera.instance.quaternion)
        console.log('Visibility of canvas:')
        const averageGreyColor = sumGreyColor / totalGreyPixel
        console.log(`Average grey color: ${averageGreyColor}, ${averageGreyColor}, ${averageGreyColor}`)
        console.log(`Avg visibility depth is ${averageGreyColor*100/255}%`)
    }

    enableDepthMode() {
        this.currentMode = VIEW_MODES['depth']
        this.world.city.setMaterialByMode(VIEW_MODES['depth'])
        this.world.lights.setDirectionalLight(false)
        this.renderer.updateClearColor(`rgb(${DEPTH_SKY})`)
    }
    enableVisibilityMode() {
        this.currentMode = VIEW_MODES['visibility']
        this.world.city.setMaterialByMode(VIEW_MODES['visibility'])
        this.world.lights.setDirectionalLight(false)
        this.renderer.updateClearColor(`rgb(${OBJECT_TO_COLOR['sky']})`)
    }
    enableRealWorldMode() {
        this.currentMode = VIEW_MODES['realWorld']
        this.world.city.setMaterialByMode(VIEW_MODES['realWorld'])
        this.world.lights.setDirectionalLight(true)
        this.renderer.updateClearColor(`${REAL_WORLD_OBJECT_TO_COLOR['sky']}`)
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