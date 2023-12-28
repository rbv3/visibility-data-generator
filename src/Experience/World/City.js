import * as THREE from 'three'
import Experience from '../Experience'
import { collada_models } from './models.js'

const map = {}
const terrainMap = {}
const buildingMap = {}

export default class City {
    constructor() {
        this.experience = new Experience()
        this.characterControls = this.experience.characterControls
        this.loaders = this.experience.loaders
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.gui = this.experience.gui

        this.buildingsMeshes = []
        // visibility test
        this.defaultMaterial = this.createCustomMaterial('#8ba4c7')
        this.buildingMaterial = this.createCustomMaterial('#ff0000')
        this.treeMaterial = this.createCustomMaterial('#00ff00')
        this.waterMaterial = this.createCustomMaterial('#0000ff')
        this.roadMaterial = this.createCustomMaterial('#ffff00')
        this.sidewalkMaterial = this.createCustomMaterial('#cccc00')
        this.surfaceMaterial = this.createCustomMaterial('#888800')
        this.subwayMaterial = this.createCustomMaterial('#ff00ff')
        this.streetLightMaterial = this.createCustomMaterial('#00ffff')
    }
    createCustomMaterial(color) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color)
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
                    this.auxRecursiveIterator(gltf.scene, gltf.metadataMap)
                    console.log(gltf.metadataMap)
                    console.log(Object.keys(gltf.metadataMap).length)
                    console.log(gltf.scene)
                    this.scene.add(gltf.scene)
                    loaded++
                    if(loaded == toLoad) {
                        console.log(map)
                        console.log(terrainMap)
                        console.log(buildingMap)
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
    auxRecursiveIterator(object3d, metadataMap) {
        const children = object3d.children
        for(const child of children) {
            this.recursiveChildAction(child, metadataMap)
        }
    }
    recursiveChildAction(child, metadataMap) {
        if(child.name in metadataMap) {
            child.userData = metadataMap[child.name]
            
            if(child.userData.type === 'entity') {
                this.setEntityChild(child)
            } else if(child.userData.terrain?.length > 0) {
                this.setTerrainChild(child)
            } else {
                this.setBuildingChild(child)
            }
        }
        return

    }
    setEntityChild(child) {
        const key = child.userData['entity:type']
        this.hydrateMap(key, map)
        
        switch(key) {
        case 'tree':
            this.recursiveSetMaterial(child, this.treeMaterial)
            break
        case 'street_light':
            this.recursiveSetMaterial(child, this.streetLightMaterial)
            break
        case 'subway_entrance':
            this.recursiveSetMaterial(child, this.subwayMaterial)
            break
        case 'bus_shelter':
        case 'bus_stop':
        case 'collection_box':
        case 'hydrant':
        case 'waste_receptacle':
        case 'street_sign_sign':
            this.recursiveSetMaterial(child, this.defaultMaterial)
            break
        }
    }
    setBuildingChild(child) {
        const key = child.userData.building
        this.hydrateMap(key, buildingMap)
        this.recursiveSetMaterial(child, this.buildingMaterial)
    }
    setTerrainChild(child) {
        const key = child.userData['terrain']
        this.hydrateMap(key, terrainMap)
        console.log(child)
        switch(key) {
        case 'water':
            this.recursiveSetMaterial(child, this.waterMaterial)
            break
        case 'road':
            this.recursiveSetMaterial(child, this.roadMaterial)
            break
        case 'sidewalk':
            this.recursiveSetMaterial(child, this.sidewalkMaterial)
            break
        case 'surface':
            this.recursiveSetMaterial(child, this.surfaceMaterial)
            break
        }
    }
    recursiveSetMaterial(child, material) {
        if(child.isMesh) {
            child.material = material
            return
        }
        if(child.children.length > 0) {
            child.children.forEach(c => this.recursiveSetMaterial(c, material))
        }
    }
    hydrateMap(key, map) {
        if(key in map) {
            map[key]++
        } else {
            map[key] = 1
        }
    }
}