import * as THREE from 'three'
import * as PAPA from 'papaparse'

import { download_csv, getDistance } from './helpers'
import Experience from '../Experience'
import { CAMERA_BUILDING_LOOKAT, CAMERA_LOOKAT, VIEW_MODES, ADDITIONAL_HEIGHTS} from './constants'

const MIN_DISTANCE = 10
const MIN_FILTER_DISTANCE = 30

export default class ScreenshotHelper {
    constructor() {
        this.screenShotPositions = []
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer
    }
    isValidPoint(pointsToAvoid, point) {
        for(let j = 0; j < pointsToAvoid.length; j++) {
            // horizontal distance
            const currDistance = getDistance(point, pointsToAvoid[j])
            if(currDistance < MIN_DISTANCE) {
                return false
            }
        }
        return true
    }
    getValidPoints(pointsOfInterest, pointsToAvoid) {
        console.log(pointsOfInterest.length)
        console.log(pointsToAvoid.length)
        for(let i = 0; i < pointsOfInterest.length; i++) {
            const isValid = this.isValidPoint(pointsToAvoid, pointsOfInterest[i])
            if(isValid) {
                this.screenShotPositions.push(pointsOfInterest[i])
            }
            if(i%500 == 0) {
                console.log(`${i*100/pointsOfInterest.length}% | ${isValid} | ${i}`)
                console.log(this.screenShotPositions.length)
            }

        }
        console.log(this.screenShotPositions)
    }
    createParticleOnPosition(screenshotPositions, size = 10) {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(screenshotPositions.length * 3)

        for(let i=0; i<screenshotPositions.length; i++) {
            const i3 = i*3
            positions[i3] = screenshotPositions[i][0]
            positions[i3+1] = screenshotPositions[i][1]
            positions[i3+2] = screenshotPositions[i][2]
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        )

        // material
        const material = new THREE.PointsMaterial({
            size,
            color: 'red'
        })

        // points
        const points = new THREE.Points(geometry, material)
        console.log(points)

        this.scene.add(points)
    }
    validateFilterScreenshotPositions(point, filteredPositions) {
        for(let j = 0; j < filteredPositions.length; j++) {
            // horizontal distance
            const currDistance = getDistance(point, filteredPositions[j])
            if(currDistance < MIN_FILTER_DISTANCE) {
                return false
            }
        }
        return true
    }
    filterScreenshotPositions(scPositions) {
        const filteredPositions = []
        filteredPositions.push(scPositions[0])
        for(let i = 1; i < scPositions.length; i++) {
            if(this.validateFilterScreenshotPositions(scPositions[i], filteredPositions)) {
                filteredPositions.push(scPositions[i])
            }
        }
        return filteredPositions
    }
    generateImages(scPositions, shouldCreateImage, shouldDownloadCsv = true) {
        return this.generateImageOfMode(scPositions, this.experience.currentMode, shouldCreateImage, shouldDownloadCsv)
    }
    generateImageOfMode(scPositions, mode, shouldCreateImage, shouldDownloadCsv = true) {
        const start = performance.now()
        /*Euler Angles and World Roation Angles - 02.03.2025*/
        const csv = {
            fields: [
                'x',
                'y',
                'z',
                'xh',
                'yh',
                'zh',
                'f_xyz',
                'image_name'
            ],
            data: []
        }

        /*Sperical coordinates 01.31.2025
        const csv = {
            fields: [
                'x',
                'y',
                'z',
                'phi',
                'theta',
                'f_xyz',
                'image_name'
            ],
            data: []
        }
        */

        // disable update to improve performance
        this.experience.shouldUpdateOnTick = false
        
        console.log("There will be generated ", scPositions.length.toLocaleString(), " positions")
        
        for(let i = 0; i < scPositions.length; i++) {

            let percentageProgress = ((i+1)/scPositions.length.toLocaleString()*100).toFixed(2)
            console.log(`${percentageProgress}% - Position ${i+1}/${scPositions.length.toLocaleString()}`)
            
            //add multiple heights here:
            const cameraPosOff20 = [...scPositions[i]]
            cameraPosOff20[1] += 20
            // const cameraPosOff70 = [...scPositions[i]]
            // cameraPosOff70[1] += 70
            for(let j = 0; j < CAMERA_LOOKAT.length; j++) {
                const imageName = `pos${i}-${j}-${mode}`
                // offset height by 20
                this.camera.instance.position.set(...cameraPosOff20)
                this.camera.instance.lookAt(CAMERA_LOOKAT[j])
                this.experience.update() // force update b4 screenshot

                // csv.data.push(this.createCsvLineForScene(`${imageName}-20`))
                let csvLine = this.createCsvLineForScene(`${imageName}-20`)
                console.log(csvLine)
                csv.data.push(csvLine)

                if(shouldCreateImage) {
                    this.renderer.createImage(`${imageName}-20`)
                }
    
                // offset height by 70
                // this.camera.instance.position.set(...cameraPosOff70)
                // this.camera.instance.lookAt(CAMERA_LOOKAT[j])
                // this.experience.update() // force update b4 screenshot

                // csv.data.push(this.createCsvLineForScene(`${imageName}-70`))
                // if(shouldCreateImage) {
                //     this.renderer.createImage(`${imageName}-70`)
                // }

                /*lines below are duplicates from the above ones, if height smaller than 60*/ 
                //replicating the blocks above for multiple hieghts. ADDITIONAL_HEIGHTS in constants.js 02.03.2025
                for (let h in ADDITIONAL_HEIGHTS){
                    const cameraPosOff = [...scPositions[i]]
                    const additionalHeight = ADDITIONAL_HEIGHTS[h]
                    cameraPosOff[1] += additionalHeight

                    this.camera.instance.position.set(...cameraPosOff)
                    this.camera.instance.lookAt(CAMERA_LOOKAT[j])
                    this.experience.update() // force update b4 screenshot

                    let csvLine = this.createCsvLineForScene(`${imageName}-${additionalHeight}`)
                    console.log(csvLine)
                    csv.data.push(csvLine)
                    
                    // csv.data.push(this.createCsvLineForScene(`${imageName}-${additionalHeight}`))
                    if(shouldCreateImage) {
                        this.renderer.createImage(`${imageName}-${additionalHeight}`)
                    }

                }
            }
        }
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)

        const csvFile = PAPA.unparse(csv)
        if(shouldDownloadCsv) {
            download_csv(csvFile, `${this.experience.currentMode}`)
        }

        this.experience.shouldUpdateOnTick = true

        return csvFile
    }

    generateBuildingImages(scPositions, buildingName) {
        this.generateBuildingImageOfMode(scPositions, buildingName, this.experience.currentMode)
    }
    generateBuildingImageOfMode(scPositions, buildingName, mode) {
        let shouldCreateImage = false
        const start = performance.now()
        // disable update to improve performance
        this.experience.shouldUpdateOnTick = false
        const isVisibility = mode == VIEW_MODES.visibility
        
        /*Euler Angles and World Roation Angles - 02.03.2025*/
        const csvCommonFields = [
            'x',
            'y',
            'z',
            'xh',
            'yh',
            'zh',
        ]

        /*Sperical coordinates 01.31.2025
        const csvCommonFields = [
                'x',
                'y',
                'z',
                'phi',
                'theta',
            ]
        */

        if(isVisibility) {
            csvCommonFields.push('f_xyz')
        }

        const csv = {
            fields: [
                ...csvCommonFields,
                'image_name'
            ],
            data: []
        }
        
        console.log("There will be generated ", scPositions.length.toLocaleString(), " positions")
        
        for(let i = 0; i < scPositions.length; i++) {
            let percentageProgress = ((i+1)/scPositions.length.toLocaleString()*100).toFixed(2)
            console.log(`${percentageProgress}% - Position ${i+1}/${scPositions.length.toLocaleString()}`)
            for(let j = 0; j < CAMERA_BUILDING_LOOKAT.length; j++) {
                const imageName = `${buildingName}-${i}-${j}-${mode}`
                
                this.camera.instance.position.set(...scPositions[i])
                this.camera.instance.lookAt(CAMERA_LOOKAT[j])
                
                this.renderer.compile()
                this.experience.update() // force update b4 screenshots
                
                
                let csvLine = this.createCsvLineForBuilding(`${imageName}-down`, isVisibility)
                console.log(csvLine)
                csv.data.push(csvLine)

                this.renderer.createImage(`${imageName}-down`,i,j)

                /*lines below are duplicates from the above ones, if height smaller than 60*/ 
                // offset to current position height - commented on 02.03.2025
                /*
                if(scPositions[i][1] < 60) {
                    continue
                }
                const lookAtOffset = [...CAMERA_LOOKAT[j]]
                lookAtOffset[1] = scPositions[i][1]
                this.camera.instance.lookAt(...lookAtOffset)
                this.experience.update() // force update b4 screenshot

                csv.data.push(this.createCsvLineForBuilding(`${imageName}-front`, isVisibility))

                this.renderer.createImage(`${imageName}-front`)
                */

                /*lines below are duplicates from the above ones, if height smaller than 60*/ 
                //replicating the blocks above for multiple hieghts. ADDITIONAL_HEIGHTS in constants.js 02.03.2025
                for (let h in ADDITIONAL_HEIGHTS){
                    const cameraPosOff = [...scPositions[i]]
                    const additionalHeight = ADDITIONAL_HEIGHTS[h]
                    cameraPosOff[1] += additionalHeight

                    this.camera.instance.position.set(...cameraPosOff)

                    //Make the camera lookat Heigth to be the same as the position
                    const lookAtOffset = [...CAMERA_LOOKAT[j]]
                    lookAtOffset[1] = scPositions[i][1]
                    this.camera.instance.lookAt(...lookAtOffset)

                    // this.camera.instance.lookAt(CAMERA_LOOKAT[j])
                    this.experience.update() // force update b4 screenshot
                    let csvLine = this.createCsvLineForBuilding(`${imageName}-${additionalHeight}`, isVisibility)
                    console.log(csvLine)
                    csv.data.push(csvLine)
                    if(shouldCreateImage) {
                        this.renderer.createImage(`${imageName}-${additionalHeight}`)
                    }

                }
            }
        }
        const csvFile = PAPA.unparse(csv)
        download_csv(csvFile, `location-${buildingName}-${mode}`)
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)

        this.experience.shouldUpdateOnTick = true
    }
    createCsvLineForScene(fileName) {
        if(this.experience.currentMode == VIEW_MODES['visibility'] || this.experience.currentMode == VIEW_MODES['buildingData']){
            const countColorCsv = this.experience.countColorOfPixels()
            countColorCsv.push(fileName)
            let csvLine = countColorCsv
            return csvLine
        }
        return
    }
    createCsvLineForBuilding(fileName, isVisibility) {
        let csvLine
        if(isVisibility) {
            csvLine = this.experience.countColorOfPixels()
        } else {
            csvLine = this.experience.getCameraCoordinates()
        }
        csvLine.push(fileName)
        
        return csvLine
    }
}
