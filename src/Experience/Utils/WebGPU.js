
export default class WebGPU {
    constructor() {
        this.instace = this.setUpWebGPU()
    }
    async setUpWebGPU() {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
            return
        }
        const device = await adapter.requestDevice()
        const gpuBuffer = device.createBuffer({
            mappedAtCreation: true,
            size: 4,
            usage: GPUBufferUsage.MAP_WRITE
        })
        const arrayBuffer = gpuBuffer.getMappedRange()
          
        // Write bytes to buffer.
        new Uint8Array(arrayBuffer).set([0, 1, 2, 3])
    }
}