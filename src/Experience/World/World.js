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

        this.povWorld = this.experience.povWorld

        this.particleHelper = new ParticleHelper()

        this.loaders = new Loaders()

        this.lights = new Lights()
        this.city = new City()
        this.buildingMeshes = this.city.buildingMeshes

        this.city.loadModels()

        this.scene.add(this.lights.directionalLight)
        this.scene.add(this.lights.ambientLight)

        
        this.queryLocationParameters = {
            numLocations: {
                value: 5
            },
            water: {
                value: 1
            },
            building: {
                value: 0
            },
            sky: {
                value: 0
            },
            tree: {
                value: 0
            },
        }

        this.setGUI()
    }
    callQueryLocation() {        
        this.visibilityEncoderService.queryLocation(
            this.queryLocationParameters.numLocations.value,
            1,
            this.normalizeGoal([
                this.queryLocationParameters.building.value,
                this.queryLocationParameters.water.value,
                this.queryLocationParameters.tree.value,
                this.queryLocationParameters.sky.value,
            ])
        )
            .then(res => {
                console.log(res);
                this.povWorld.maxLocations = res.data.length
                this.povWorld.updateViewPort(res.data)
                for(const gui of this.povWorld.gui.viewportFolder.controllers) {
                    gui.max(res.data.length - 1)
                    gui.updateDisplay()
                }
                this.particleHelper.plotParticlesWithDirection(res.data)
            })
            .catch(err => {
                console.error(err);
            })
    }
    normalizeGoal(goal) {
        let sum = 0
        goal.forEach(val => sum += val)
        
        return goal.map(val => val / sum)
    }
    setGUI() {
        this.gui.queryPositionFolder.add(this.queryLocationParameters.numLocations, 'value').min(1).max(10000).step(1).name('numLocations')

        this.gui.queryPositionFolder.add(this.queryLocationParameters.building, 'value').min(0).max(1).step(0.01).name('building')
        this.gui.queryPositionFolder.add(this.queryLocationParameters.water, 'value').min(0).max(1).step(0.01).name('water')
        this.gui.queryPositionFolder.add(this.queryLocationParameters.tree, 'value').min(0).max(1).step(0.01).name('tree')
        this.gui.queryPositionFolder.add(this.queryLocationParameters.sky, 'value').min(0).max(1).step(0.01).name('sky')

        this.gui.queryPositionFolder.add({
            callQueryLocation: () => {
                this.callQueryLocation()
            }
        }, 'callQueryLocation')
    }
    update() {
        this.city.update()
    }
}