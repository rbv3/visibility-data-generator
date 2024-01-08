import * as THREE from 'three'
import Experience from '../Experience'
import { collada_models } from './models.js'
import MaterialHelper from '../Utils/MaterialHelper.js'
import { hydrateMap } from '../Utils/helpers.js'

const map = {}
const terrainMap = {}
const buildingMap = {}

export default class City {
    constructor() {
        this.materialHelper = new MaterialHelper()
        this.experience = new Experience()
        this.characterControls = this.experience.characterControls
        this.loaders = this.experience.loaders
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.gui = this.experience.gui

        this.meshesToUpdateMaterial = []
    }
    loadModels() {
        const toLoad = collada_models.length
        let loaded = 0
        for(const model of collada_models) {
            this.loaders.colladaLoader.load(
                model.path,
                (gltf) => {
                    this.auxRecursiveIterator(gltf.scene, gltf.metadataMap)
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
    setMaterialByMode(mode) {
        this.setMaterial(this.materialHelper.materialMap[mode])
    }

    setMaterial(materialMap) {
        this.meshesToUpdateMaterial.forEach(child => {
            if(child.userData.type === 'entity') {
                this.setMaterialEntityChild(child, materialMap)
            } else if(child.userData.terrain?.length > 0) {
                this.setMaterialTerrainChild(child, materialMap)
            } else {
                this.setMaterialBuildingChild(child, materialMap)
            }
        })
    }
    setMaterialEntityChild(child, materialMap) {
        const key = child.userData['entity:type']
        hydrateMap(key, map)
        
        switch(key) {
        case 'tree':
            this.recursiveSetMaterial(
                child,
                materialMap['tree'],
                child.userData
            )
            break
        case 'street_light':
        case 'subway_entrance':
        case 'bus_shelter':
        case 'bus_stop':
        case 'collection_box':
        case 'hydrant':
        case 'waste_receptacle':
        case 'street_sign_sign':
            this.recursiveSetMaterial(
                child,
                materialMap['default'],
                child.userData
            )
            break
        }
    }
    setMaterialTerrainChild(child, materialMap) {
        const key = child.userData['terrain']
        hydrateMap(key, terrainMap)
        switch(key) {
        case 'water':
            this.recursiveSetMaterial(
                child,
                materialMap['water'],
                child.userData
            )
            break
        case 'road':
            this.recursiveSetMaterial(
                child,
                materialMap['road'],
                child.userData
            )
            break
        case 'sidewalk':
            this.recursiveSetMaterial(
                child,
                materialMap['sidewalk'],
                child.userData
            )
            break
        case 'surface':
            this.recursiveSetMaterial(
                child,
                materialMap['surface'],
                child.userData
            )
            break
        }
    }
    setMaterialBuildingChild(child, materialMap) {
        const key = child.userData.building
        hydrateMap(key, buildingMap)

        const boundingBoxGroupName = 'geopipeinodeHx9pKZTR'
        if(child.name == boundingBoxGroupName) {
            console.log(child)
            let boundingBox = new THREE.Box3().setFromObject(child, true)
            const helper = new THREE.Box3Helper( boundingBox, 0xffff00 )
            helper.updateMatrixWorld(true)
            child.add( helper )

            this.recursiveSetMaterial(
                child,
                materialMap['default'],
                child.userData
            )
            return
        }
        this.recursiveSetMaterial(
            child,
            materialMap['building'],
            child.userData
        )
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
                this.setMaterialEntityChild(child, this.materialHelper.materialMap['realWorld'])
            } else if(child.userData.terrain?.length > 0) {
                this.setMaterialTerrainChild(child, this.materialHelper.materialMap['realWorld'])
            } else {
                this.setMaterialBuildingChild(child, this.materialHelper.materialMap['realWorld'])
            }
        }
        return

    }
    recursiveSetMaterial(child, material, userData) {
        if(Object.keys(child.userData).length == 0) {
            child.userData = userData
        }
        const childUserData = child.userData

        if(child.isMesh) {
            this.meshesToUpdateMaterial.push(child)
            child.material = material
            return
        }
        if(child.children.length > 0) {
            child.children.forEach(c => this.recursiveSetMaterial(c, material, childUserData))
        }
    }
}