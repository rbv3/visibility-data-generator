import * as THREE from 'three'
import Experience from '../Experience'

import { OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR } from './constants'
import { VIEW_MODES } from './constants'


export default class MaterialHelper {
    constructor() {
        this.experience = new Experience()
        this.materialMap = {
            [VIEW_MODES['depth']]: this.setDepthMaterials(),
            [VIEW_MODES['visibility']]: this.setVisibilityMaterials(),
            [VIEW_MODES['realWorld']]: this.setRealWorldMaterials()
        }
    }
    setVisibilityMaterials() {
        return {
            default: this.createCustomMaterial('#8ba4c7'),
            // buildings
            building: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['building']})`),
            // surfaces
            water: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['water']})`),
            road: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['road']})`),
            sidewalk: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['sidewalk']})`),
            surface: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['surface']})`),
            // entities
            tree: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['tree']})`)
        }
    }
    setDepthMaterials() {
        this.depthMaterial = this.setCustomMeshDepthMaterial()
        return {
            default: this.depthMaterial,
            // buildings
            building: this.depthMaterial,
            // surfaces
            water: this.depthMaterial,
            road: this.depthMaterial,
            sidewalk: this.depthMaterial,
            surface: this.depthMaterial,
            // entities
            tree: this.depthMaterial
        }
    }
    setRealWorldMaterials() {
        return {
            default: this.createCustomMaterial('#3d3d3d'),
            // buildings
            building: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['building']}`),
            // surfaces
            water: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['water']}`),
            road: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['road']}`),
            sidewalk: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['sidewalk']}`),
            surface: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['surface']}`),
            // entities
            tree: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['tree']}`),
        }
    }

    createCustomMaterial(color) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color)
        })

        return customMaterial
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
}