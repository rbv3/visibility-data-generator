import * as THREE from 'three'
import Experience from '../Experience'
import { collada_models } from './models.js'

const map = {}

export default class City {
    constructor() {
        this.experience = new Experience()
        this.characterControls = this.experience.characterControls
        this.loaders = this.experience.loaders
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.gui = this.experience.gui

        this.buildingsMeshes = []
        this.defaultMaterial = this.createCustomMaterial('white')
        // visibility test
        this.buildingMaterial = this.createBuildingMaterial('#ff0000', false, true)
        this.treeMaterial = this.createCustomMaterial('#00ff00')
        this.waterMaterial = this.createCustomMaterial('#0000ff')
        this.floorMaterial = this.createCustomMaterial('#ffff00')
        this.subwayMaterial = this.createCustomMaterial('#ff00ff')
        this.streetLightMaterial = this.createCustomMaterial('#00ffff')
    }
    createCustomMaterial(color) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color)
        })

        return customMaterial
    }
    createBuildingMaterial(color, transparent, depthWrite) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent,
            depthWrite,
        })

        return customMaterial
    }
    loadModels() {
        const toLoad = collada_models.length
        let loaded = 0
        for(const model of collada_models) {
            this.loaders.colladaLoader.load(
                model.path,
                (gltf) => {
                    // this.auxRecursiveIterator(gltf.scene)
                    console.log(gltf.scene)
                    console.log(gltf.library.visualScenes)
                    this.scene.add(gltf.scene)
                    loaded++
                    if(loaded == toLoad) {
                        console.log(map)
                    }
                },
                () => {}, // progress callback
                (err) => console.log(err)
            )
        }
    }
    getGltfSceneParent(gltfScene) {
        for(const child of gltfScene.children) {
            if(!child.isMesh) {
                return child
            }
        }
    }
    auxRecursiveIterator(object3d) {
        const children = object3d.children
        for(const child of children) {
            this.recursiveChildAction(child)
        }
    }
    recursiveChildAction(child) {
        if(child.isMesh &&
           child.material.isMeshStandardMaterial &&
           child.name.length > 0
        ) {
            const key = child.name.split('_')[0]
            if(map[key]) {
                map[key]++
            } else {
                map[key] = 1
            }
            child.material = this.defaultMaterial
            switch(key) {
            case 'tree':
                child.material = this.treeMaterial
                break
            case 'floor':
                child.material = this.floorMaterial
                break
            case 'water':
                child.material = this.waterMaterial
                break
            case 'street':
                child.material = this.streetLightMaterial
                break
            case 'subway':
                child.material = this.subwayMaterial
                break
            case 'buildings': {
                child.material = this.buildingMaterial
                break
            }
            case 'empire-states':
                child.material = this.buildingMaterial
                break
            }

        }
        if(child.children.length > 0) {
            for(const c of child.children) {
                this.recursiveChildAction(c)
            }
        }
    }
}