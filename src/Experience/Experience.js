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
import { createCsvColor, increaseMapFrequency, isGreyColor, roundColor } from './Utils/helpers.js'
import ScreenshotHelper from './Utils/ScreenshotHelper.js'

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
        this.buildingMeshes = this.world.buildingMeshes
        this.raycaster = new RayCaster()
        this.screenshotHelper = new ScreenshotHelper()

        this.currentMode = VIEW_MODES.realWorld

        this.shouldUpdateOnTick = true

        // Events
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time.on('tick', () => {
            if(this.shouldUpdateOnTick) {
                this.update()
            }
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
                this.countColorOfPixels(true)
            }}, 'countColorOfPixels')
        
        this.gui.instance.add({
            generateImagesAndCsv: () => {
                this.screenshotHelper.generateImages(
                    this.world.city.filteredScreenshotPositions,
                    true
                )
            }}, 'generateImagesAndCsv')

        this.gui.instance.add({
            generateCsvOnly: () => {
                this.screenshotHelper.generateImages(
                    this.world.city.filteredScreenshotPositions,
                    false
                )
            }}, 'generateCsvOnly')
    }
    countColorOfPixels(shouldLogResults = false) {
        if(this.currentMode == VIEW_MODES['realWorld']) {
            console.warn('This method should not be used on Real World Rendering')
            return
        }
        const gl = this.renderer.instance.getContext()
        const readPixelBuffer = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer)
        
        if(this.currentMode == VIEW_MODES['visibility']) {
            return this.countColorVisiblityMode(readPixelBuffer, shouldLogResults)
        }
        if(this.currentMode == VIEW_MODES['depth']) {
            this.countColorDepthMode(readPixelBuffer)
            return
        }

        console.warn('unexpected view mode')
    }
    countColorVisiblityMode(readPixelBuffer, shouldLogResults) {
        let csvLine = []
        const colorMap = {}
        for(let i = 0; i < readPixelBuffer.length; i += 4) {
            let color = [
                readPixelBuffer[i],
                readPixelBuffer[i + 1],
                readPixelBuffer[i + 2]
            ]
            color = roundColor(color)

            if(!(color in COLOR_TO_OBJECT)) {
                increaseMapFrequency('unknown', colorMap)

                continue
            }
            increaseMapFrequency(color, colorMap)
        }
        // console.log('Camera position and quaternion:')
        // console.log(this.camera.instance.position)
        
        csvLine.push(`${this.camera.instance.position.x}`)
        csvLine.push(`${this.camera.instance.position.y}`)
        csvLine.push(`${this.camera.instance.position.z}`)
        
        // console.log(this.camera.instance.quaternion)
        
        csvLine.push(`${this.camera.instance.rotation.x * (180/Math.PI)}`)
        csvLine.push(`${this.camera.instance.rotation.y * (180/Math.PI)}`)
        csvLine.push(`${this.camera.instance.rotation.z * (180/Math.PI)}`)
        
        const totalPixels = readPixelBuffer.length / 4
        if(shouldLogResults) {
            console.log('Visibility of canvas:')
            for(const color in colorMap) {
                if(color in COLOR_TO_OBJECT) {
                    console.log(`${COLOR_TO_OBJECT[color]}: ${colorMap[color] * 100 / totalPixels}% | ${colorMap[color]} pixels`)
                } else {
                    console.log(`${color}: ${colorMap[color] * 100 / totalPixels}% | ${colorMap[color]} pixels`)
                }
            }
        }

        csvLine.push(createCsvColor(colorMap))
        return csvLine
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
    getCameraCoordinates() {
        let csvLine = []

        csvLine.push(`${this.camera.instance.position.x}`)
        csvLine.push(`${this.camera.instance.position.y}`)
        csvLine.push(`${this.camera.instance.position.z}`)
        
        csvLine.push(`${this.camera.instance.rotation.x * (180/Math.PI)}`)
        csvLine.push(`${this.camera.instance.rotation.y * (180/Math.PI)}`)
        csvLine.push(`${this.camera.instance.rotation.z * (180/Math.PI)}`)
        
        return csvLine
    }

    enableDepthMode() {
        const start = performance.now()

        this.currentMode = VIEW_MODES['depth']
        this.world.city.setMaterialByMode(VIEW_MODES['depth'])
        this.world.lights.setDirectionalLight(false)
        this.renderer.updateClearColor(`rgb(${DEPTH_SKY})`)
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)
    }
    enableVisibilityMode() {
        const start = performance.now()

        this.currentMode = VIEW_MODES['visibility']
        this.world.city.setMaterialByMode(VIEW_MODES['visibility'])
        this.world.lights.setDirectionalLight(false)
        this.renderer.updateClearColor(`rgb(${OBJECT_TO_COLOR['sky']})`)
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)

    }
    enableRealWorldMode() {
        const start = performance.now()

        this.currentMode = VIEW_MODES['realWorld']
        this.world.city.setMaterialByMode(VIEW_MODES['realWorld'])
        this.world.lights.setDirectionalLight(true)
        this.renderer.updateClearColor(`${REAL_WORLD_OBJECT_TO_COLOR['sky']}`)
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)

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
        this.world.update()
        this.characterControls.update()

        this.statsMonitor.instance.end()
    }
}