import * as THREE from 'three'
import Experience from './Experience'
import MaterialHelper from './Utils/MaterialHelper'
import { createArrayOfPointsFromGroup, createOBBHelper, updateChildrenMaterial } from './Utils/helpers'
import * as YUKA from 'yuka'



export default class RayCaster {
    constructor() {
        this.instance = new THREE.Raycaster()
        
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.screenshotHelper = this.experience.world.city.screenshotHelper

        this.sizes = this.experience.sizes
        this.buildingMeshes = this.experience.buildingMeshes
        this.mouse = new THREE.Vector2()

        this.materialHelper = new MaterialHelper()

        this.previousHovered = undefined
        this.hoveredBuilding = undefined

        this.previousClicked = undefined
        this.clickedBuilding = undefined

        this.currentBoundingBox = undefined
        this.previousBoundingBox = undefined

        this.rotationMatrix = new THREE.Matrix4() // create once and reuse it


        window.addEventListener('mousemove', (_event) => {
            this.mouse.x = (_event.clientX / this.sizes.width) * 2 - 1
            this.mouse.y = - (_event.clientY / this.sizes.height) * 2 + 1
        })

        window.addEventListener('mousedown', () => {
            if(this.hoveredBuilding && this.hoveredBuilding.name !== this.clickedBuilding?.name) {
                console.log('updating clicked building')
                this.previousClicked = this.clickedBuilding
                this.clickedBuilding = this.hoveredBuilding
                
                const points = createArrayOfPointsFromGroup(this.clickedBuilding)

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
                this.updateSegment()
                this.screenshotHelper.createParticleOnPosition(this.buildingCameraPositions, 1)
                
                console.log(this.helper)
                console.log(obb)

                this.previousBoundingBox = this.currentBoundingBox
                this.currentBoundingBox = this.helper

                // this.experience.scene.add( this.helper )

                this.previousBoundingBox?.geometry.dispose()
                this.previousBoundingBox?.material.dispose()
                this.experience.scene.remove( this.previousBoundingBox )

                updateChildrenMaterial(this.clickedBuilding, this.materialHelper.materialMap['realWorld'].click)
                updateChildrenMaterial(this.previousClicked, this.materialHelper.materialMap['realWorld'].building)
            }
        })
    }

    updateSegment() {
        if(this.currentSeg > this.numSegments) {
            return
        }

        this.helper.position.y += this.heightStep

        const percentageStep = 1 / this.numSegments
        this.helper.geometry = new THREE.BoxGeometry(
            this.geometry.parameters.width,
            this.geometry.parameters.height * percentageStep,
            this.geometry.parameters.depth,
            10,
            10,
            10
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
        this.updateSegment()
    }

    update() {
        this.instance.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.instance.intersectObjects(this.buildingMeshes)
        this.hoveredBuilding = intersects[0]?.object?.parent
    }
}