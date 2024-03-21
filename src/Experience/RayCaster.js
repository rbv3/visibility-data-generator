import * as THREE from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import Experience from './Experience'
import MaterialHelper from './Utils/MaterialHelper'
import { createArrayOfPointsFromGroup, createOBBHelper, updateChildrenMaterial } from './Utils/helpers'
import * as YUKA from 'yuka'
import ParticleHelper from './Utils/ParticleHelper'



export default class RayCaster {
    constructor() {
        this.instance = new THREE.Raycaster()

        
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.screenshotHelper = this.experience.world.city.screenshotHelper
        this.gui = this.experience.gui
        this.visibilityEncoderService = this.experience.visibilityEncoderService
        this.particleHelper = new ParticleHelper()

        this.setTransformControl()

        this.sizes = this.experience.sizes
        this.buildingMeshes = this.experience.buildingMeshes
        this.mouse = new THREE.Vector2()

        this.materialHelper = new MaterialHelper()

        this.previousHovered = undefined
        this.hoveredBuilding = undefined

        this.previousClicked = undefined
        this.clickedBuilding = undefined
        this.clickedBuildingHeight = undefined
        this.clickedBuildingCenter = undefined

        this.currentBoundingBox = undefined
        this.previousBoundingBox = undefined


        this.setGUI()

        window.addEventListener('mousemove', (_event) => {
            this.mouse.x = (_event.clientX / this.sizes.width) * 2 - 1
            this.mouse.y = - (_event.clientY / this.sizes.height) * 2 + 1
        })

        window.addEventListener('mousedown', (event) => {
            if (event.target.className != 'webgl') {
                return
            }
            if(this.hoveredBuilding && this.hoveredBuilding.name !== this.clickedBuilding?.name) {
                console.log('updating clicked building')
                this.previousClicked = this.clickedBuilding
                this.clickedBuilding = this.hoveredBuilding
                
                const points = createArrayOfPointsFromGroup(this.clickedBuilding)
                    
                const boundingBoxHelper = this.createBoundingBox(points)
                console.log(boundingBoxHelper)

                this.pointsByNormal = this.groupPointsByNormal(boundingBoxHelper.geometry, boundingBoxHelper)

                // this.updateTransformControl()

                updateChildrenMaterial(this.clickedBuilding, this.materialHelper.materialMap[this.experience.currentMode].click)
                updateChildrenMaterial(this.previousClicked, this.materialHelper.materialMap[this.experience.currentMode].building)
            }
        })
    }
    callGetFacadesForClickedBuilding() {
        const basePoint = this.pointsByNormal.get('[0,-1,0]')
        console.log(basePoint)
        this.visibilityEncoderService.predictFacadeFromBasePoints(basePoint, this.clickedBuildingHeight)
            .then(res => {
                console.log(res.data)
                this.particleHelper.resetResultPoints()
                this.particleHelper.plotParticlesForVisibilityEnconderResult(res.data)

            })
            .catch(err => {
                console.log('Error: ', err.message)
            })
    }
    callTestEnconderOnData() {
        const filteredPoints = this.particleHelper.filterPointsByRadius(
            30 + this.clickedBuildingHeight * 2,
            [
                this.clickedBuildingCenter.x,
                this.clickedBuildingCenter.y,
                this.clickedBuildingCenter.z
            ]
        )
        this.experience.scene.remove(this.boundingBox)
        const csv = this.screenshotHelper.generateImages(
            filteredPoints,
            false,
            false
        )
        console.log(csv)
        this.experience.scene.add(this.boundingBox)

        this.visibilityEncoderService.testEncoderOnData()
    }
    groupPointsByNormal(geometry, boxHelper) {
        const { normal, position } = geometry.attributes
        const pointsByNormal = new Map()
        
        for(let i=0; i < position.array.length; i+=3){
            const normalCoord = [
                normal.array[i + 0],
                normal.array[i + 1],
                normal.array[i + 2],
            ]
            const positionCoord = [
                position.array[i + 0],
                position.array[i + 1],
                position.array[i + 2],
            ]

            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute( position, i/3 )
            boxHelper.localToWorld( vertex )
            vertex.toArray(positionCoord)

            if(!pointsByNormal.has(JSON.stringify(normalCoord))) {
                pointsByNormal.set(JSON.stringify(normalCoord), [])
            }
            pointsByNormal.set(JSON.stringify(normalCoord), [...pointsByNormal.get(JSON.stringify(normalCoord)), positionCoord])
        }
        return pointsByNormal
    }
    updateTransformControl() {
        this.clickedBuilding.children.forEach(child => {
            const g = child.geometry
            g.computeBoundingBox()
            var centroid = new THREE.Vector3()
            centroid.addVectors(g.boundingBox.min, g.boundingBox.max).divideScalar(2)
            console.log(centroid)
            g.center()

            child.position.copy(centroid)
        })
        const m1 = this.clickedBuilding.children[0]
        const m2 = this.clickedBuilding.children[1]
        const m3 = this.clickedBuilding.children[2]
        this.clickedBuilding.position
            .copy(
                new THREE.Vector3(
                    m1.position.x,
                    m1.position.y,
                    m1.position.z
                )
            ).add(
                new THREE.Vector3(
                    m2.position.x,
                    m2.position.y,
                    m2.position.z
                )
            ).add(
                new THREE.Vector3(
                    m3.position.x,
                    m3.position.y,
                    m3.position.z
                )
            ).multiplyScalar(1 / 3)
        
        this.clickedBuilding.remove(m1)
        this.clickedBuilding.remove(m2)
        this.clickedBuilding.remove(m3)
        this.clickedBuilding.attach(m1)
        this.clickedBuilding.attach(m2)
        this.clickedBuilding.attach(m3)
        this.clickedBuilding.updateMatrixWorld()

        
        this.transformControl.attach( this.clickedBuilding )
        console.log(this.transformControl)
    }
    setTransformControl() {
        this.transformControl =  new TransformControls( this.camera.instance, this.experience.renderer.instance.domElement )
        this.transformControl.setMode( 'scale' )
        this.experience.scene.add( this.transformControl )

        window.addEventListener( 'keydown',  ( event ) => {
            switch ( event.keyCode ) {

            case 87: // W
                this.transformControl.setMode( 'translate' )
                break


            case 82: // R
                this.transformControl.setMode( 'scale' )
                break

            case 27: // Esc
                this.transformControl.reset()
                break

            }

        } )
    }

    createBoundingBox(points) {
        const obb = new YUKA.OBB().fromPoints( points )
        this.helper = createOBBHelper( obb )
        
        console.log(this.helper)
        console.log(obb)

        this.clickedBuildingHeight = obb.halfSizes.y * 2
        this.clickedBuildingCenter = obb.center

        this.previousBoundingBox = this.currentBoundingBox
        this.currentBoundingBox = this.helper

        this.experience.scene.add( this.helper )

        this.previousBoundingBox?.geometry.dispose()
        this.previousBoundingBox?.material.dispose()
        this.experience.scene.remove( this.previousBoundingBox )

        return this.helper
    }
    createSlidingBoundingBox(points) {
        const obb = new YUKA.OBB().fromPoints( points )
        this.helper = createOBBHelper( obb )
        const { geometry } = this.helper
        console.log(geometry)

        this.numSegments = Math.ceil(geometry.parameters.height / 5)
        this.currentSeg = 1
        this.geometry = geometry

        let lowestY = Infinity, highestY = -Infinity
        for(let i = 0; i < points.length; i++) {
            lowestY = Math.min(lowestY, points[i].y)
            highestY = Math.max(highestY, points[i].y)
        }
        console.log({lowestY, highestY})

        this.maxHeight = highestY
        this.helper.position.y = lowestY
        console.log('maxH: ' + this.maxHeight)
        console.log('posY' + this.helper.position.y)
        this.heightStep = (this.maxHeight - this.helper.position.y) / this.numSegments

        this.buildingCameraPositions = []
        this.updateSegment(
            Math.ceil(geometry.parameters.width/10),
            Math.ceil(geometry.parameters.depth/10),
        )
        
        console.log(this.helper)
        console.log(obb)

        this.previousBoundingBox = this.currentBoundingBox
        this.currentBoundingBox = this.helper

        // this.experience.scene.add( this.helper )

        this.previousBoundingBox?.geometry.dispose()
        this.previousBoundingBox?.material.dispose()
        this.experience.scene.remove( this.previousBoundingBox )
    }

    updateSegment(widthSegments, depthSegments) {
        if(this.currentSeg > this.numSegments) {
            return
        }

        this.helper.position.y += this.heightStep

        const percentageStep = 1 / this.numSegments
        this.helper.geometry = new THREE.BoxGeometry(
            this.geometry.parameters.width,
            this.geometry.parameters.height * percentageStep,
            this.geometry.parameters.depth,
            widthSegments,
            1,
            depthSegments
        )
        const positions = this.helper.geometry.getAttribute( 'position' )
        const normals = this.helper.geometry.getAttribute( 'normal' )
        const topSidePositions = []
        
        for(let i = 0; i < positions.array.length; i+=3) {
            let index = i / 3

            const normal = new THREE.Vector3()
            normal.fromBufferAttribute( normals, index )

            if(
                normal.x == 0 &&
                normal.y == 1 &&
                normal.z == 0
            ) {
                const vertex = new THREE.Vector3()
                vertex.fromBufferAttribute( positions, index )
                this.helper.localToWorld( vertex )

                topSidePositions.push(vertex.toArray())
            }
        }

        this.currentSeg++
        this.buildingCameraPositions.push(...topSidePositions)
        this.updateSegment(widthSegments, depthSegments)
    }
    screenShotBuilding() {
        if(!this.buildingCameraPositions?.length) {
            console.warn('No building selected')
            return
        }
        this.screenshotHelper.generateBuildingImages(this.buildingCameraPositions, this.clickedBuilding.name)
    }
    plotRadiusScreenshotPositions() {
        this.particleHelper.resetRadiusPoints()
        this.particleHelper.plotPointsInsideRadius(
            30 + this.clickedBuildingHeight * 2,
            [
                this.clickedBuildingCenter.x,
                this.clickedBuildingCenter.y,
                this.clickedBuildingCenter.z,
            ]
        )
    }
    setGUI() {
        this.gui.instance.add({
            screenShotSelectedBuilding : () => {
                this.screenShotBuilding()
            }}, 'screenShotSelectedBuilding')
        
        this.gui.instance.add({
            callGetFacadesForClickedBuilding : () => {
                this.callGetFacadesForClickedBuilding()
            }}, 'callGetFacadesForClickedBuilding')

        this.gui.instance.add({
            callTestEnconderOnData : () => {
                this.callTestEnconderOnData()
            }}, 'callTestEnconderOnData')

        this.gui.instance.add({
            plotRadiusSCPosition : () => {
                this.plotRadiusScreenshotPositions()
            }}, 'plotRadiusSCPosition')
    }
    update() {
        this.instance.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.instance.intersectObjects(this.buildingMeshes)
        this.hoveredBuilding = intersects[0]?.object?.parent
    }
}