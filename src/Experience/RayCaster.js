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
                const helper = createOBBHelper( obb )

                this.previousBoundingBox = this.currentBoundingBox
                this.currentBoundingBox = helper

                this.experience.scene.add( helper )

                this.previousBoundingBox?.geometry.dispose()
                this.previousBoundingBox?.material.dispose()
                this.experience.scene.remove( this.previousBoundingBox )

                updateChildrenMaterial(this.clickedBuilding, this.materialHelper.materialMap['realWorld'].click)
                updateChildrenMaterial(this.previousClicked, this.materialHelper.materialMap['realWorld'].building)
            }
        })
    }
    update() {
        this.instance.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.instance.intersectObjects(this.buildingMeshes)
        this.hoveredBuilding = intersects[0]?.object?.parent
    }
}