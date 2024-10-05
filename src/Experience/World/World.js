import Experience from '../Experience'
import Loaders from '../Utils/Loaders'
import Lights from '../Lights'
import City from './City'
import ParticleHelper from '../Utils/ParticleHelper'
import { normalizeGoal } from '../Utils/helpers'
import Histogram from '../D3Selection/Histogram/Histogram'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.visibilityEncoderService = this.experience.visibilityEncoderService
        this.gui = this.experience.gui
        this.birdsEye = this.experience.birdsEye

        this.povWorld = this.experience.povWorld

        this.particleHelper = new ParticleHelper()

        // this.histogram = new Histogram(this.particleHelper)
        this.histogram = new Histogram()

        this.loaders = new Loaders()

        this.lights = new Lights()
        this.city = new City()
        this.buildingMeshes = this.city.buildingMeshes

        this.city.loadModels()

        this.scene.add(this.lights.directionalLightA)
        this.scene.add(this.lights.directionalLightB)
        this.scene.add(this.lights.ambientLight)

        this.queryParameters = {};
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
    setQueryParameters(dictionary) {
        this.queryParameters = {};
        dictionary.forEach(val => {
            const name = val['name'].toLowerCase()
            const percentage = val['value'] / 100;
            this.queryParameters[name] = percentage;
        })
        console.log(this.queryParameters);
    }
    callQueryLocation() {        
        this.visibilityEncoderService.queryLocation(
            this.queryLocationParameters.numLocations.value,
            1,
            normalizeGoal([
                this.queryLocationParameters.building.value,
                this.queryLocationParameters.water.value,
                this.queryLocationParameters.tree.value,
                this.queryLocationParameters.sky.value,
            ])
        )
            .then(res => {
                console.log(res);
                this.updatePovInterface(res);
                this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(res.data)
            })
            .catch(err => {
                console.error(err);
            })
    }

    callQueryLocationOnPlane() {     
        const plane = this.birdsEye.plane
        const planeScale = plane.scale
        const planeCenter = plane.position
        const planeWidth = plane.geometry.parameters.width * planeScale.x
        const planeHeight = plane.geometry.parameters.height * planeScale.z
        
        const planeDirections = this.birdsEye.getPlaneDirections()
        
        this.visibilityEncoderService.queryLocationOnPlane({
            numLocations: this.queryLocationParameters.numLocations.value,
            seed: 20,
            goals: normalizeGoal([
                this.queryLocationParameters.building.value,
                this.queryLocationParameters.water.value,
                this.queryLocationParameters.tree.value,
                this.queryLocationParameters.sky.value,
            ]),
            pointOnPlane: [...planeCenter],
            direction1: planeDirections[0],
            direction2: planeDirections[1],
            radius: [planeWidth, planeHeight]
        })
            .then(res => {
                console.log(res);
                this.updatePovInterface(res);
                this.experience.queryLocationParticles = this.particleHelper.plotParticlesWithDirection(res.data)
                this.histogram.resetHistogram()
                this.histogram.createHistogram(res.data)
            })
            .catch(err => {
                console.error(err);
            })
    }

    updatePovInterface(res) {
        this.povWorld.forEach((world) => {
            world.maxLocations = res.data.length
            world.updateViewPort(res.data)
            for(const gui of world.gui.viewportFolder.controllers) {
                gui.max(res.data.length - 1)
                gui.updateDisplay()
            }
        })
    }

    updatePovInterfaceAfterBrushOnHistogram(res) {
        this.povWorld.forEach((world) => {
            world.updateViewPort(res)
            for(const gui of world.gui.viewportFolder.controllers) {
                gui.max(res.length - 1)
                gui.updateDisplay()
            }
        })
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

        this.gui.queryPositionFolder.add({
            callQueryLocationOnPlane: () => {
                this.callQueryLocationOnPlane()
            }
        }, 'callQueryLocationOnPlane')
    }
    update() {
        this.city.update()
    }
}