import * as THREE from 'three'
import Experience from '../Experience'
import { collada_models } from './models.js'
import { OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR } from '../Utils/constants.js'

const map = {}
const terrainMap = {}
const buildingMap = {}

export default class City {
    constructor(visibility) {
        this.experience = new Experience()
        this.characterControls = this.experience.characterControls
        this.loaders = this.experience.loaders
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.gui = this.experience.gui
        this.isVisibility = visibility
        this.meshesToUpdateMaterial = []

        this.depthMaterial = this.setCustomMeshDepthMaterial()

        // visibility test
        this.defaultMaterial = this.createCustomMaterial('#8ba4c7')
        // buildings
        this.buildingMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['building']})`)
        // surfaces
        this.waterMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['water']})`)
        this.roadMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['road']})`)
        this.sidewalkMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['sidewalk']})`)
        this.surfaceMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['surface']})`)
        // entities
        this.treeMaterial = this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['tree']})`)

        // "Real World" materials
        this.realWorldDefaultMaterial = this.createCustomMaterial('#3d3d3d')
        // buildings
        this.realWorldBuildingMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['building']}`)
        // surfaces
        this.realWorldWaterMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['water']}`)
        this.realWorldRoadMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['road']}`)
        this.realWorldSidewalkMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['sidewalk']}`)
        this.realWorldsurfaceMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['surface']}`)
        // entities
        this.realWorldTreeMaterial = this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['tree']}`)
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
                    // this.setDepthMaterial()
                },
                () => {}, // progress callback
                (err) => console.log(err)
            )
        }
    }
    toggleMaterial() {
        console.log(this.isVisibility)
        this.isVisibility = !this.isVisibility
        this.meshesToUpdateMaterial.forEach(child => {
            if(child.userData.type === 'entity') {
                this.setEntityChild(child, this.isVisibility)
            } else if(child.userData.terrain?.length > 0) {
                this.setTerrainChild(child, this.isVisibility)
            } else {
                this.setBuildingChild(child, this.isVisibility)
            }
        })
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
                this.setEntityChild(child, this.isVisibility)
            } else if(child.userData.terrain?.length > 0) {
                this.setTerrainChild(child, this.isVisibility)
            } else {
                this.setBuildingChild(child, this.isVisibility)
            }
        }
        return

    }
    setEntityChild(child) {
        const key = child.userData['entity:type']
        this.hydrateMap(key, map)
        
        switch(key) {
        case 'tree':
            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.treeMaterial : this.realWorldTreeMaterial,
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
                this.isVisibility? this.defaultMaterial : this.realWorldDefaultMaterial,
                child.userData
            )
            break
        }
    }
    setBuildingChild(child) {
        const key = child.userData.building
        this.hydrateMap(key, buildingMap)

        const boundingBoxGroupName = 'geopipeinodeHx9pKZTR'
        if(child.name == boundingBoxGroupName) {
            let boundingBox = new THREE.Box3().setFromObject(child, true)
            const helper = new THREE.Box3Helper( boundingBox, 0xffff00 )
            helper.updateMatrixWorld(true)
            child.add( helper )

            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.defaultMaterial : this.realWorldDefaultMaterial,
                child.userData
            )
            return
        }
        this.recursiveSetMaterial(
            child,
            this.isVisibility? this.buildingMaterial : this.realWorldBuildingMaterial,
            child.userData
        )
    }
    setTerrainChild(child) {
        const key = child.userData['terrain']
        this.hydrateMap(key, terrainMap)
        switch(key) {
        case 'water':
            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.waterMaterial : this.realWorldWaterMaterial,
                child.userData
            )
            break
        case 'road':
            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.roadMaterial : this.realWorldRoadMaterial,
                child.userData
            )
            break
        case 'sidewalk':
            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.sidewalkMaterial : this.realWorldSidewalkMaterial,
                child.userData
            )
            break
        case 'surface':
            this.recursiveSetMaterial(
                child,
                this.isVisibility? this.surfaceMaterial : this.realWorldsurfaceMaterial,
                child.userData
            )
            break
        }
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
    setCustomMeshDepthMaterial() {
        const material = new THREE.MeshDepthMaterial()
        const customUniforms = {
            uCameraNear: { value: this.experience.camera.instance.near },
            uCameraFar: { value: this.experience.camera.instance.far }
        }
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uCameraNear = customUniforms.uCameraNear
            shader.uniforms.uCameraFar = customUniforms.uCameraFar

            shader.fragmentShader = shader.fragmentShader
                .replace(
                    '#include <common>',
                    `
                        uniform float uCameraNear;
                        uniform float uCameraFar;
                    `
                )
                .replace(
                    'float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;',
                    `
                        float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
                        float viewZ = perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar);
                        float depth = viewZToOrthographicDepth(viewZ, uCameraNear, uCameraFar);
                    `,
                )
                .replace(
                    'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
                    'gl_FragColor = vec4( vec3( depth ), opacity );'
                ).replace(
                    'gl_FragColor = packDepthToRGBA( fragCoordZ )',
                    'gl_FragColor = packDepthToRGBA( 1.0 - depth );'
                )
        }
        return material
    }
    setDepthMaterial() {
        console.log(this.meshesToUpdateMaterial)
        this.meshesToUpdateMaterial.forEach(mesh => {
            mesh.material = this.depthMaterial
        })
    }
    hydrateMap(key, map) {
        if(key in map) {
            map[key]++
        } else {
            map[key] = 1
        }
    }
}