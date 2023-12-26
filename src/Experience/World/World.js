import Experience from '../Experience'
import Loaders from '../Utils/Loaders'
import Lights from '../Lights'
import City from './City'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.loaders = new Loaders()
        this.lights = new Lights()
        this.city = new City()
        this.buildingsMeshes = this.city.buildingsMeshes

        this.city.loadModels()

        // this.scene.add(this.lights.directionalLight)
        this.scene.add(this.lights.ambientLight)
    }
    update() {
        this.city.update()
    }
}