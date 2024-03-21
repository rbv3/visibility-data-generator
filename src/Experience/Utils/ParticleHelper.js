import * as THREE from 'three'

import Experience from '../Experience'
import { sc1 } from '../Utils/screenshotPositions.js'
import { getDistance3D } from './helpers.js'
import { CAMERA_LOOKAT } from './constants.js'

export default class ParticleHelper {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.gui = this.experience.gui

        this.lastResult = undefined

        this.visibilityOptions = {
            building: 0,
            water: 1,
            tree: 2,
            sky:3,
        }
        this.currentVisibility = 'building'

        this.currentLookAt = 0

        this.createLookAtParticle()
        this.setGUI()
    }
    createLookAtParticle() {
        // const position = CAMERA_LOOKAT[this.currentLookAt]
        const position = new THREE.Vector3(
            0,
            0,
            0
        )
        const material = new THREE.PointsMaterial({
            size: 50,
        })
        const geometry = new THREE.BufferGeometry()
        this.lookAtParticle = new THREE.Points(geometry, material)
        this.lookAtParticle.position.set(position)

        console.log(this.lookAtParticle)
        this.scene.add(this.lookAtParticle)
    }
    updateLookAtParticle() {

    }
    updateLookAtParticlesForVisibilityEncoder() {
        this.currentLookAt += 1
        this.currentLookAt %= 6
        
        // this.points.geometry = this.lookAtResults[this.currentLookAt].geometry
        this.resetResultPoints()
        this.plotParticlesForVisibilityEnconderResult(this.lastResult)

        console.log(this.currentLookAt)
    }
    plotParticlesForVisibilityEnconderResult(result) {
        // material
        const material = new THREE.PointsMaterial({
            size: 3,
        })
        material.vertexColors = true

        this.lastResult = result

        this.lookAtResults = [
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            {
                // we divide by 6 because we have 6 lookAt positions
                geometry: new THREE.BufferGeometry(),
                positions: new Float32Array(result.length * 3 / 6),
                colors: new Float32Array(result.length * 3 / 6) // *3 cuz RGB
            },
            
        ]
        console.log(this.lookAtResults)
        for(let i=0; i<result.length; ) {
            for(let j=0; j<6; j++) { // we have 6 lookAt positions
                const lookAtIndex = Math.floor(i / 6) * 3
                this.lookAtResults[j].positions[lookAtIndex+0] = result[i].camera_coordinates[0]
                this.lookAtResults[j].positions[lookAtIndex+1] = result[i].camera_coordinates[1]
                this.lookAtResults[j].positions[lookAtIndex+2] = result[i].camera_coordinates[2]
                const color = this.setColorBasedOnVisibility(result[i].predictions)
                // console.log(color)
                this.lookAtResults[j].colors[lookAtIndex+0] = color[0]
                this.lookAtResults[j].colors[lookAtIndex+1] = color[1]
                this.lookAtResults[j].colors[lookAtIndex+2] = color[2]
                i++
            }
        }
        this.lookAtResults.forEach(result => {
            console.log(result)
            result.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(result.positions, 3)
            )
            result.geometry.setAttribute(
                'color',
                new THREE.BufferAttribute(result.colors, 3)
            )
            console.log(result.colors)
        })


        // points
        this.points = new THREE.Points(this.lookAtResults[this.currentLookAt].geometry, material)
        this.points.geometry.buffersNeedUpdate = true
        console.log(this.points)
        // points.rotation.set(-1.5707963267948966, 0, 0)

        this.scene.add(this.points)
    }
    resetPoints(points) {
        if(!points) {
            return
        }
        this.scene.remove(points)
        points.material.dispose()
        points.geometry.dispose()
        points = undefined
    }
    resetResultPoints() {
        this.resetPoints(this.points)
    }
    resetRadiusPoints() {
        this.resetPoints(this.radiusPoints)
    }
    updateParticleColors(visibility) {
        if(!this.points) {
            return
        }
        this.resetResultPoints()
        this.currentVisibility = visibility
        this.plotParticlesForVisibilityEnconderResult(this.lastResult)
    }
    setColorBasedOnVisibility(predictions) {
        const color = [0, 0, 0]
        switch(this.currentVisibility) {
        case 'building': //building
            color[0] = predictions[0]
            break
        case 'water':
            color[2] = predictions[1]
            break
        case 'tree':
            color[1] = predictions[2]
            break
        case 'sky':
            color[0] = predictions[3]
            color[1] = predictions[3]
            color[2] = predictions[3]
            break
        }
        return color
    }
    setGUI() {

        this.gui.instance.add({
            updateLookAtParticlesForVisibilityEncoder : () => {
                this.updateLookAtParticlesForVisibilityEncoder()
            }}, 'updateLookAtParticlesForVisibilityEncoder')
        this.gui.instance.add({
            buildingScores : () => {
                this.updateParticleColors('building')
            }}, 'buildingScores')
        
        this.gui.instance.add({
            waterScores : () => {
                this.updateParticleColors('water')
            }}, 'waterScores')
                
        this.gui.instance.add({
            treeScores : () => {
                this.updateParticleColors('tree')
            }}, 'treeScores')


        this.gui.instance.add({
            skyScores : () => {
                this.updateParticleColors('sky')
            }}, 'skyScores')
    }
    plotPointsInsideRadius(radius, center) {
        const pointsInsideRadius = this.filterPointsByRadius(radius, center)
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(pointsInsideRadius.length * 3)

        for(let i=0; i<pointsInsideRadius.length; i++) {
            const i3 = i*3
            positions[i3] = pointsInsideRadius[i][0]
            positions[i3+1] = pointsInsideRadius[i][1]
            positions[i3+2] = pointsInsideRadius[i][2]
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
        this.radiusPoints = new THREE.Points(geometry, material)

        this.scene.add(this.radiusPoints)
    }
    filterPointsByRadius(radius, center) {
        console.log(radius, center)
        const filteredPoints = []
        console.log(sc1)
        sc1.forEach(point => {
            if(getDistance3D(center, point) <= radius) {
                filteredPoints.push(point)
            }
        })
        console.log(filteredPoints)
        return filteredPoints
    }
}