import * as THREE from 'three'
import Experience from '../Experience'
import { custom_models } from './models.js'
import vertexSetUniformAndCreateMethods from '../Shaders/City/VertexShader/setUniformAndCreateMethods.glsl'
import vertexUpdateMainFunction from '../Shaders/City/VertexShader/updateMainFunction.glsl'
import fragmentSetUniformAndCreateMethods from '../Shaders/City/FragmentShader/setUniformAndCreateMethods.glsl'
import fragmentUpdateMainFunction from '../Shaders/City/FragmentShader/updateMainFunction.glsl'

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
        this.customUniforms = {
            uDiameterX: { value: 10000 },
            uDiameterZ: { value: 10000 },
            uIsDeformationX: { value: 0 },
            uIsDeformationZ: { value: 0 },
            uOpacity: { value: 0.2 },
            // uInvisibilityRadius: { value: 100 },
            uInvisibilityRadius: { value: 0 },
            uControlsPosition: { value: 0 },
        }
        this.setGUI()
        this.defaultMaterial = this.createCustomMaterial('white')
        this.treeMaterial = this.createCustomMaterial('#266944')
        this.waterMaterial = this.createCustomMaterial('#4bcfe3')
        this.floorMaterial = this.createCustomMaterial('#cecece')
        this.streetLightMaterial = this.createCustomMaterial('#4d4d4d')
        this.subwayMaterial = this.createCustomMaterial('#304034')
        this.goldenMaterial = this.createBuildingMaterial('#ffd700', false, true)
        this.transparentGoldenMaterial = this.createBuildingMaterial('#ffd700', true, false)
        this.transparentBuildingMaterial = this.createBuildingMaterial('#c9c3b7', true, false)
        this.buildingMaterial = this.createBuildingMaterial('#c9c3b7', false, true)
        // visibility test
        this.buildingMaterial = this.createBuildingMaterial('#ff0000', false, true)
        this.treeMaterial = this.createCustomMaterial('#00ff00')
        this.waterMaterial = this.createCustomMaterial('#0000ff')
        this.floorMaterial = this.createCustomMaterial('#ffff00')
        this.subwayMaterial = this.createCustomMaterial('#ff00ff')
        this.streetLightMaterial = this.createCustomMaterial('#00ffff')
        //
        this.transparentBuildingsGeometries = []
        this.buildingMeshes = []
        this.pointsOfInterest = []
    }
    createCustomMaterial(color) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color)
        })

        customMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uDiameterX = this.customUniforms.uDiameterX
            shader.uniforms.uDiameterZ = this.customUniforms.uDiameterZ
            shader.uniforms.uIsDeformationX = this.customUniforms.uIsDeformationX
            shader.uniforms.uIsDeformationZ = this.customUniforms.uIsDeformationZ
			
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                vertexSetUniformAndCreateMethods,
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>',
                vertexUpdateMainFunction
            )
        }

        return customMaterial
    }
    createBuildingMaterial(color, transparent, depthWrite) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent,
            depthWrite,
        })

        customMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uDiameterX = this.customUniforms.uDiameterX
            shader.uniforms.uDiameterZ = this.customUniforms.uDiameterZ
            shader.uniforms.uIsDeformationX = this.customUniforms.uIsDeformationX
            shader.uniforms.uIsDeformationZ = this.customUniforms.uIsDeformationZ
            
            shader.uniforms.uOpacity = this.customUniforms.uOpacity
            shader.uniforms.uInvisibilityRadius = this.customUniforms.uInvisibilityRadius
            shader.uniforms.uControlsPosition = this.customUniforms.uControlsPosition
            shader.uniforms.uIsTransparent = { value: transparent }

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                vertexSetUniformAndCreateMethods,
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>',
                vertexUpdateMainFunction
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <clipping_planes_pars_fragment>',
                fragmentSetUniformAndCreateMethods
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                fragmentUpdateMainFunction
            )
        }

        return customMaterial
    }
    loadModels() {
        const toLoad = custom_models.length
        let loaded = 0
        for(const model of custom_models) {
            this.loaders.gltfLoader.load(
                model.path,
                (gltf) => {
                    this.auxRecursiveIterator(gltf.scene)
                    console.log(gltf.scene)
                    this.scene.add(gltf.scene)
                    loaded++
                    if(loaded == toLoad) {
                        console.log(map)

                        // transparent meshes should be added after all opaque ones to preserve renderOrder
                        for(const child of this.buildingMeshes) {
                            const newBuilding = this.cloneMeshAndSetMaterial(child, this.transparentBuildingMaterial)
                            this.getGltfSceneParent(gltf.scene).add(newBuilding)
                        }
                        for(const child of this.pointsOfInterest) {
                            const newPointOfInterest = this.cloneMeshAndSetMaterial(child, this.transparentGoldenMaterial)
                            this.getGltfSceneParent(gltf.scene).add(newPointOfInterest)
                        }
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
                this.buildingMeshes.push(child)
                break
            }
            case 'empire-states':
                child.material = this.buildingMaterial
                // child.material = this.goldenMaterial
                this.pointsOfInterest.push(child)
                break
            }

        }
        if(child.children.length > 0) {
            for(const c of child.children) {
                this.recursiveChildAction(c)
            }
        }
    }
    cloneMeshAndSetMaterial(mesh, material) {
        const newBuilding = new THREE.Mesh(
            mesh.geometry.clone(),
            material
        )
        let meshPosition = new THREE.Vector3()
        newBuilding.getWorldPosition(meshPosition)

        mesh.parent.add(newBuilding)

        // Here the new mesh needs to re-learn its new coordinates
        newBuilding.updateMatrixWorld(true)

        newBuilding.worldToLocal(meshPosition)
        newBuilding.position.set(meshPosition.x, meshPosition.y, meshPosition.z)

        return newBuilding
    }

    setGUI() {
        this.gui.instance.add(this.customUniforms.uDiameterX, 'value')
            .min(1500)
            .max(10000)
            .step(1)
            .name('diameterX')
        
        this.gui.instance.add(this.customUniforms.uDiameterZ, 'value')
            .min(1500)
            .max(10000)
            .step(1)
            .name('diameterZ')
		
        this.gui.instance.add(this.customUniforms.uIsDeformationX, 'value')
            .min(0)
            .max(1)
            .step(1)
            .name('deformationX')
		
        this.gui.instance.add(this.customUniforms.uIsDeformationZ, 'value')
            .min(0)
            .max(1)
            .step(1)
            .name('deformationZ')
        
        this.gui.instance.add(this.customUniforms.uOpacity, 'value')
            .min(0)
            .max(0.7)
            .step(0.01)
            .name('opacity')
        this.gui.instance.add(this.customUniforms.uInvisibilityRadius, 'value')
            .min(1)
            .max(2000)
            .step(1)
            .name('invisibility radius')
    }
    update() {
        if(this.characterControls.controls) {
            this.customUniforms.uControlsPosition.value = this.characterControls.controls.getObject().position
        }
    }
}