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

    //Dataset generation using random euler angles:
    generateImageOfMode(scPositions, mode, shouldCreateImage, shouldDownloadCsv = true) {
        const start = performance.now()
        let end = performance.now()
        /*Euler Angles and World Roation Angles - 02.03.2025*/
        let csv = {
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
        // disable update to improve performance
        this.experience.shouldUpdateOnTick = false
        let numberOfAnglesPerLocation = 2

        let loggingEvery = 1 
        console.log(`There will be generated ${scPositions.length.toLocaleString()} positions each with ${ADDITIONAL_HEIGHTS.length} heights and ${numberOfAnglesPerLocation} view angles. In total ${(scPositions.length * ADDITIONAL_HEIGHTS.length * numberOfAnglesPerLocation).toLocaleString()} views. Logging every ${loggingEvery}%` )
        for(let i = 0; i < scPositions.length; i++) {
            let percentageProgress = ((i+1)/scPositions.length*100).toFixed(2)
            if (((i+1) % Math.floor(scPositions.length / (Math.floor(100 / loggingEvery)))) == 0){ 
                //20 screenshots take 15 - 30 seconds. - Since 2k postions in scPositions.length
                // ETA in hours ~ ADDITIONAL_HEIGHTS.length * numberOfAnglesPerLocation
                //Log only for each x% progress //2000 for 0.05%, 100 for 1% and 20 for 5%
                end = performance.now()
                console.log(`${percentageProgress}% - Position ${i+1}/${scPositions.length.toLocaleString()} - In CSV file we have a total of ${csv.data.length.toLocaleString()} - Elapsed time: ${((end - start) / 1000).toFixed(2)}s - ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`)
            }
            for (let h in ADDITIONAL_HEIGHTS){ //for each height
                for (let j = 0; j < numberOfAnglesPerLocation; j++){ //for each angle
                    const imageName = `pos${i}-${j}-${mode}`
                    //1. set camera possition x, z from screenshotPositions.js and height from ADDITIONAL_HEIGHTS, in constants.js
                    const cameraPosOff = [...scPositions[i]]
                    const additionalHeight = ADDITIONAL_HEIGHTS[h]
                    cameraPosOff[1] += additionalHeight
                    cameraPosOff[0] += Math.random()*10 - 5 //Add some variability to x and z
                    cameraPosOff[2] += Math.random()*10 - 5
                    this.camera.instance.position.set(...cameraPosOff)

                    //2. set camera orientation - check rotateToRandomAngle in Camera.js for testing
                    let xRandomAngle = Math.random()*10 - 5
                    let yRandomAngle = Math.random()*360 - 180
                    // console.log(`Random generated angles - x:${xRandomAngle}, y: ${yRandomAngle}`)
                    let euler = new THREE.Euler(THREE.MathUtils.degToRad(xRandomAngle), THREE.MathUtils.degToRad(yRandomAngle), 0, 'YXZ'); // Rotation around X, then Y, then Z
                    // Create rotation matrix
                    let rotationMatrix = new THREE.Matrix4();
                    rotationMatrix.makeRotationFromEuler(euler);
                    // Apply to camera's quaternion
                    this.camera.instance.quaternion.setFromRotationMatrix(rotationMatrix);
                    // Ensure matrix updates
                    this.camera.instance.updateMatrixWorld(true);
                    this.experience.update() // force update b4 screenshot

                    //3. Add entry to CSV data entry
                    let csvLine = this.createCsvLineForScene(`${imageName}-${additionalHeight}`)
                    // console.log(csvLine)
                    csv.data.push(csvLine)
                    
                    // csv.data.push(this.createCsvLineForScene(`${imageName}-${additionalHeight}`))
                    if(shouldCreateImage) {
                        this.renderer.createImage(`${imageName}-${additionalHeight}`)
                    }
                }
            }
            //Save Csvs in batches, after each postion, to avoid memory overflow and browser crashing:
            const csvFile = PAPA.unparse(csv)
            if(shouldDownloadCsv) {
                let csvFileName = `${this.experience.currentMode}_${i}_${scPositions.length}`
                download_csv(csvFile, csvFileName)
            }
            csv = {
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
            // if (i==30){
            //     break //testing purposes.
            // }
        }

        end = performance.now()
        console.log(`Execution time: ${((end - start) / 1000).toFixed(2)} s`)

        const csvFile = PAPA.unparse(csv)
        if(shouldDownloadCsv) {
            // let csvFileName = `${this.experience.currentMode}_${i}_${scPositions.length}`
            download_csv(csvFile, csvFileName)
        }

        this.experience.shouldUpdateOnTick = true

        return csvFile
        
    }

    //Dataset generation using lookats
    generateImageOfModeBackup(scPositions, mode, shouldCreateImage, shouldDownloadCsv = true) {
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
