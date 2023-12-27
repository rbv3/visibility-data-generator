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