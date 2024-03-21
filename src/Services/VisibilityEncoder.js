import axios, * as others from 'axios'

export default class VisibilityEncoder {
    constructor() {
    }

    testEncoderOnCurrentPosition(currentPosition) {
        const params = {
            // nmt: 'None'
        }
        // if(buildingHeight) {
        //     params.bh = Math.round(buildingHeight * 1.2)
        //     params.ppf = Math.round(Math.round(buildingHeight) * 30 / 6)
        // }
        return axios(
            {
                method: 'post',
                baseURL: 'http://127.0.0.1:5000/',
                params,
                url: '/test_encoder_on_current_position',
                headers: {
                    scheme: 'http',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                data: currentPosition
                
            }
        )
    }
    predictFacadeFromBasePoints(facadePoints, buildingHeight) {
        const params = {
            // nmt: 'None'
        }
        if(buildingHeight) {
            params.bh = Math.round(buildingHeight)
            params.ppf = Math.round(Math.round(buildingHeight) * 30 / 6)
        }
        return axios(
            {
                method: 'post',
                baseURL: 'http://127.0.0.1:5000/',
                params,
                url: '/predict_facade_from_base_points',
                headers: {
                    scheme: 'http',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                data: facadePoints
            }
        )
    }
    testEncoderOnData(locationData) {
        const params = {
            // nmt: 'None'
        }
        axios(
            {
                method: 'post',
                baseURL: 'http://127.0.0.1:5000/',
                params,
                url: '/test_encoder_on_data',
                headers: {
                    scheme: 'http',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                data: locationData
            }
        )
    }
    printPredictionArray(predictions) {
        const classes = ['building', ' water', ' tree', ' sky']
        for(let i=0; i<predictions.length; i++) {
            console.log(`${classes[i]}: ${predictions[i]}`)
        }
    }
}