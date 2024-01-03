import Experience from '../Experience'
import Loaders from '../Utils/Loaders'
import Lights from '../Lights'
import City from './City'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.loaders = new Loaders()
        this.isVisibility = false

        this.lights = new Lights(this.isVisibility)
        this.city = new City(this.isVisibility)
        this.buildingsMeshes = this.city.buildingsMeshes

        this.city.loadModels()

        this.scene.add(this.lights.directionalLight)
        this.scene.add(this.lights.ambientLight)
    }
}