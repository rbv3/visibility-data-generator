import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ColladaLoader } from './ColladaLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Experience from '../Experience'


export default class Loaders {
    constructor() {
        this.experience = new Experience
        
        this.gltfLoader = new GLTFLoader(this.loadingManager)
        this.colladaLoader = new ColladaLoader(this.loadingManager)
        this.setDracoLoader()
    }
    setDracoLoader() {
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('/draco/')

        this.gltfLoader.setDRACOLoader(this.dracoLoader)
    }
}
