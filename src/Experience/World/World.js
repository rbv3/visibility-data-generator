import Experience from '../Experience'
import Loaders from '../Utils/Loaders'
import Lights from '../Lights'
import City from './City'
import ParticleHelper from '../Utils/ParticleHelper'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.visibilityEncoderService = this.experience.visibilityEncoderService
        this.gui = this.experience.gui

        this.particleHelper = new ParticleHelper()

        this.loaders = new Loaders()

        this.lights = new Lights()
        this.city = new City()
        this.buildingMeshes = this.city.buildingMeshes

        this.city.loadModels()

        this.scene.add(this.lights.directionalLight)
        this.scene.add(this.lights.ambientLight)

        
        this.numPositionsQueryLocation = {
            value: 5
        }

        this.setGUI()
    }
    callQueryLocation() {        
        this.visibilityEncoderService.queryLocation(
            this.numPositionsQueryLocation.value,
            1,
            [0, 1, 0, 0]
        )
            .then(res => {
                console.log(res);
                this.particleHelper.plotParticlesWithDirection(res.data)
            })
            .catch(err => {
                console.log(err);
                this.particleHelper.plotParticlesWithDirection(mockResult)
            })
    }
    setGUI() {
        const queryPositionFolder = this.gui.instance.addFolder('QueryPosition');
        queryPositionFolder.add(this.numPositionsQueryLocation, 'value', 1, 1000, 1 ).min(1).max(10000).step(1).name('numLocations')
        queryPositionFolder.add({
            callQueryLocation: () => {
                this.callQueryLocation()
            }
        }, 'callQueryLocation')
        queryPositionFolder.close()
    }
    update() {
        this.city.update()
    }
}