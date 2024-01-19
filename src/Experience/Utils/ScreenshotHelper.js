import { getDistance } from './helpers'

const MIN_DISTANCE = 50

export default class ScreenshotHelper {
    constructor() {
        this.screenShotPositions = []
    }
    isValidPoint(pointsToAvoid, point) {
        for(let j = 0; j < pointsToAvoid.length; j++) {
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
}
