import EventEmitter from './EventEmitter.js'
export default class Sizes extends EventEmitter {
    constructor() {
        super()
        const canvas = document.querySelector('canvas.webgl')

        this.width = canvas.clientHeight
        this.height = canvas.clientHeight
        this.pixelRatio = 1
        
        // window.addEventListener('resize', () => {
        // this.width = window.innerWidth
        // this.height = window.innerHeight
        //     this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        //     this.trigger('resize')
        // })
    }
}