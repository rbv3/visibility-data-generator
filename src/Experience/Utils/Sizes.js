import EventEmitter from './EventEmitter.js'
export default class Sizes extends EventEmitter {
    constructor() {
        super()
        const canvas = document.querySelector('.canvasColumn')
        const canvasPadding = parseFloat(getComputedStyle(canvas).padding);
        this.width = canvas.clientHeight - canvasPadding * 4
        this.height = canvas.clientHeight - canvasPadding * 4
        this.pixelRatio = 1
        
        window.addEventListener('resize', () => {
            const tempCanvas = document.querySelector('.canvasColumn')

            this.width = tempCanvas.clientHeight - canvasPadding * 4
            this.height = tempCanvas.clientHeight - canvasPadding * 4

            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            this.trigger('resize')
        })
    }
}