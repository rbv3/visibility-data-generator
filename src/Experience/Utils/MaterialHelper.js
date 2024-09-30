import * as THREE from 'three'
import Experience from '../Experience'

import { OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR } from './constants'
import { VIEW_MODES } from './constants'

let instance = null
export default class MaterialHelper {
    constructor() {
        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        this.experience = new Experience()
        this.materialMap = {
            [VIEW_MODES['depth']]: this.setDepthMaterials(),
            [VIEW_MODES['visibility']]: this.setVisibilityMaterials(),
            [VIEW_MODES['realWorld']]: this.setRealWorldMaterials()
        }
    }
    setVisibilityMaterials() {
        return {
            default: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['miscelaneous']})`),
            // buildings
            building: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['building']})`),
            // surfaces
            water: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['water']})`),
            road: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['road']})`),
            sidewalk: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['sidewalk']})`),
            surface: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['surface']})`),
            // entities
            tree: this.createCustomMaterial(`rgb(${OBJECT_TO_COLOR['tree']})`),
            //mouse interactions
            click: this.createCustomMaterial('#eb15b2', true, 0.0),
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
            building: (height) => this.createRealWorldBuildingMaterial(height),
            // surfaces
            water: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['water']}`),
            road: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['road']}`),
            sidewalk: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['sidewalk']}`),
            surface: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['surface']}`),
            // entities
            tree: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['tree']}`),
            //mouse interactions
            hover: this.createCustomMaterial('#66ff00'),
            click: this.createCustomMaterial(`${REAL_WORLD_OBJECT_TO_COLOR['building']}`, true, 1),
        }
    }

    // histograma
    // kernel density estimation

    createCustomMaterial(color, transparent = false, opacity = 1, wireframe = false) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent,
            wireframe,
            opacity
        })

        return customMaterial
    }

    createRealWorldBuildingMaterial(height=0) {
        const customUniforms = {
            uHeight: { value: height },
            uMaxHeight: { value: 100 },
            uColorA: { value: new THREE.Color(REAL_WORLD_OBJECT_TO_COLOR['building']) },
            uColorB: { value: new THREE.Color(REAL_WORLD_OBJECT_TO_COLOR['buildingB']) },
        }
        const material = new THREE.MeshStandardMaterial();

        const fragmentUniforms = `
            #include <common>

            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform float uMaxHeight;
            uniform float uHeight;
        `
        const fragmentMain = `
            #include <color_fragment>
            float mixStrength = uHeight; 
            
            vec3 color = mix(uColorA, uColorB, max(0.0, (uHeight * 1.25 / uMaxHeight) - 0.5) * 2.0);
            
            diffuseColor.rgb *= vec4(color, 1.0).xyz;
        `
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uHeight = customUniforms.uHeight
            shader.uniforms.uMaxHeight = customUniforms.uMaxHeight
            shader.uniforms.uColorA = customUniforms.uColorA
            shader.uniforms.uColorB = customUniforms.uColorB
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <common>",
                fragmentUniforms,
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                fragmentMain
            )
        }
        
        return material;
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