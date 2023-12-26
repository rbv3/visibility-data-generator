import gltfPipeline from 'gltf-pipeline'
import fsExtra from 'fs-extra'

// aux_file to compress gltf models using Draco compression

const processGltf = gltfPipeline.processGltf
const models = [
    {
        name: 'model-0-0',
        path: '/data/NYC/simple_model/model-0-0.gltf'
    },
    {
        name: 'model-0-1',
        path: '/data/NYC/simple_model/model-0-1.gltf'
    },
    {
        name: 'model-0-2',
        path: '/data/NYC/simple_model/model-0-2.gltf'
    },
    {
        name: 'model-0-3',
        path: '/data/NYC/simple_model/model-0-3.gltf'
    },
    {
        name: 'model-1-0',
        path: '/data/NYC/simple_model/model-1-0.gltf'
    },
    {
        name: 'model-1-1',
        path: '/data/NYC/simple_model/model-1-1.gltf'
    },
    {
        name: 'model-1-2',
        path: '/data/NYC/simple_model/model-1-2.gltf'
    },
    {
        name: 'model-1-3',
        path: '/data/NYC/simple_model/model-1-3.gltf'
    },
    {
        name: 'model-2-0',
        path: '/data/NYC/simple_model/model-2-0.gltf'
    },
    {
        name: 'model-2-1',
        path: '/data/NYC/simple_model/model-2-1.gltf'
    },
    {
        name: 'model-2-2',
        path: '/data/NYC/simple_model/model-2-2.gltf'
    },
    {
        name: 'model-2-3',
        path: '/data/NYC/simple_model/model-2-3.gltf'
    },
]
const options = {
    dracoOptions: {
        compressionLevel: 3,
        keepUnusedElements: true,
        unifiedQuantization: true,
        quantizePositionBits: 14,
        quantizeGenericBits: 14
    },
}
models.forEach(model => {
    const gltf = fsExtra.readJsonSync(`../../../static/data/NYC/simple_model/${model.name}.gltf`)
    console.log(model.name)
    processGltf(gltf, options).then(function (results) {
        fsExtra.writeJsonSync(`../../../static/data/NYC/draco_model/draco-${model.name}.gltf`, results.gltf)
    })
})