import * as dat from 'lil-gui'

export default class GUI {
    constructor() {
        this.instance = new dat.GUI()
        this.debugObject = {}

        this.dataVisualizationFolder = this.instance.addFolder('Data Visualization')
            .close()
        this.endpointsFolder = this.instance.addFolder('Endpoints')
            .close()
        this.queryPositionFolder = this.instance.addFolder('Query Position')
            .close()
        this.dataGenerationFolder = this.instance.addFolder('Data Generation')
            .close()
        this.cameraFolder = this.instance.addFolder('Camera')
            .close()
        this.ambientOcclusionFolder = this.instance.addFolder('Ambient Occlusion')
            .close()
        this.viewportFolder = this.instance.addFolder('Viewport')
            .close()
    }
}
