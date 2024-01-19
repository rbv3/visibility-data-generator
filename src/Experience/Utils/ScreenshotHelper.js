import * as THREE from 'three'

import { getDistance } from './helpers'
import { screenshotPositions } from './screenshotPositions'
import Experience from '../Experience'

const MIN_DISTANCE = 15

export default class ScreenshotHelper {
    constructor() {
        this.screenShotPositions = []
        this.experience = new Experience()
        this.scene = this.experience.scene
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
    createParticleOnPosition(screenshotPositions) {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(screenshotPositions.length * 3)

        for(let i=0; i<screenshotPositions.length; i++) {
            const i3 = i*3
            positions[i3] = screenshotPositions[i][0]
            positions[i3+1] = screenshotPositions[i][1]
            positions[i3+2] = screenshotPositions[i][2] + 50
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        )

        // material
        const material = new THREE.PointsMaterial({
            size: 10,
            color: 'red'
        })

        // points
        const points = new THREE.Points(geometry, material)
        console.log(points)
        points.rotation.set(-1.5707963267948966, 0, 0)

        this.scene.add(points)
    }
}
