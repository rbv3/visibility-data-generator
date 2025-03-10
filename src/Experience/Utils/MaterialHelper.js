import * as THREE from 'three'
import Experience from '../Experience'

import { BUILDING_OBJECT_TO_COLOR, OBJECT_TO_COLOR, REAL_WORLD_OBJECT_TO_COLOR } from './constants'
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
            [VIEW_MODES['realWorld']]: this.setRealWorldMaterials(),
            [VIEW_MODES['buildingData']]: this.setBuildingDataMaterials()
        }
    }
    setVisibilityMaterials() {
        return {
            default: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            // buildings
            building: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['building']})`, toneMapped: false }),
            // surfaces
            water: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['water']})`, toneMapped: false }),
            road: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['road']})`, toneMapped: false }),
            sidewalk: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['sidewalk']})`, toneMapped: false }),
            surface: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['surface']})`, toneMapped: false }),
            // entities
            tree: this.createCustomMaterial({ color: `rgb(${OBJECT_TO_COLOR['tree']})`, toneMapped: false }),
            //mouse interactions
            click: this.createCustomMaterial({ color: '#eb15b2', transparent: true, opacity: 0.0, toneMapped: false }),
        }
    }

    setBuildingDataMaterials() {
        return {
            default: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            // buildings
            building: (material) => this.createBuildingDataMaterials(material),
            // surfaces
            water: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            road: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            sidewalk: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            surface: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            // entities
            tree: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
            //mouse interactions
            click: this.createCustomMaterial({ color: `rgb(${BUILDING_OBJECT_TO_COLOR['miscelaneous']})`, toneMapped: false }),
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
            default: this.createCustomMaterial({ color: '#3d3d3d' }),
            // buildings
            building: (height) => this.createRealWorldBuildingMaterial(height),
            // surfaces
            water: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['water']}` }),
            road: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['road']}` }),
            sidewalk: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['sidewalk']}` }),
            surface: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['surface']}` }),
            // entities
            tree: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['tree']}` }),
            //mouse interactions
            hover: this.createCustomMaterial({ color: '#66ff00' }),
            click: this.createCustomMaterial({ color: `${REAL_WORLD_OBJECT_TO_COLOR['building']}`, transparent: true, opacity: 1 }),
        }
    }

    // histograma
    // kernel density estimation

    createCustomMaterial({ color, transparent = false, opacity = 1, wireframe = false, toneMapped = true }) {
        const customMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent,
            wireframe,
            opacity
        })

        return customMaterial
    }
    getColorByMaterial(material) {
        // let outlierFindingDataset = true
        let outlierFindingDataset = false
        if(outlierFindingDataset){
            if (material == 'metal')
                return new THREE.Color(0, 255, 0);                
            else
                return new THREE.Color(255, 0, 0);
        }
        else{
            switch (material) {
                case 'brick':
                    return new THREE.Color(255, 0, 0);
                case 'concrete':
                    return new THREE.Color(255, 255, 0);
                case 'marble':
                    return new THREE.Color(0, 0, 255);
                case 'plaster':
                    return new THREE.Color(255, 255, 255);
                case 'metal':
                    return new THREE.Color(0, 255, 0);

            }
        }
    }
    createBuildingDataMaterials(material) {
        const color = this.getColorByMaterial(material);
        return this.createCustomMaterial({ color, toneMapped: false });
    }
    createRealWorldBuildingMaterial(height = 0) {
        const customUniforms = {
            uHeight: { value: height },
            uMaxHeight: { value: 100 },
            uColorA: { value: new THREE.Color(REAL_WORLD_OBJECT_TO_COLOR['building']) },
            uColorB: { value: new THREE.Color(REAL_WORLD_OBJECT_TO_COLOR['buildingB']) },
        }
        const material = new THREE.MeshStandardMaterial();

        const setVaryingUvFromVertex = `
            #include <clipping_planes_pars_vertex>
            varying vec2 vUv;
        `
        const exportUvFromVertex = `
	        #include <fog_vertex>
            vUv = uv;
        
        `
        const fragmentUniforms = `
            #include <common>

            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform float uMaxHeight;
            uniform float uHeight;

            varying vec2 vUv;
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
            shader.vertexShader = shader.vertexShader.replace(
                '#include <clipping_planes_pars_vertex>',
                setVaryingUvFromVertex,
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <fog_vertex>',
                exportUvFromVertex,
            )
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

    getBuildingMaterial(child, materialMap, mode) {
        const buildingHeight = this.buildingMaterialToInteger(child.userData["height"])
        const buildingMaterial = child.userData["building:material"]
        if (mode == VIEW_MODES.realWorld) {
            return materialMap['building'](buildingHeight)
        }
        if (mode == VIEW_MODES.buildingData) {
            return materialMap['building'](buildingMaterial)
        }

        return materialMap['building'];
    }
    buildingMaterialToInteger(material) {
        switch (material) {
            case 'marble':
                return 10;
            case 'plaster':
                return 20;
            case 'concrete':
                return 40;
            case 'brick':
                return 60;
            case 'metal':
                return 80;
            default:
                return 0;
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
}