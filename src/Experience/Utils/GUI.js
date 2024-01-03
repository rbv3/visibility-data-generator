import * as dat from 'lil-gui'

export default class GUI {
    constructor() {
        this.instance = new dat.GUI()
        this.debugObject = {}
        this.instance.close()
        // this.instance.domElement.style.display = 'none'
    }
}
