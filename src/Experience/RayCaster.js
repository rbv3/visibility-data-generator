import * as THREE from 'three'
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

        // this.setTransformControl()

        this.sizes = this.experience.sizes
        this.buildingMeshes = this.experience.buildingMeshes
        this.mouse = new THREE.Vector2()

        this.canvas = document.getElementsByClassName('webgl')[0].getBoundingClientRect();

        this.materialHelper = new MaterialHelper()

        this.previousHovered = undefined
        this.hoveredBuilding = undefined

        this.previousHoveredParticle = undefined
        this.hoveredParticle = undefined

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
            if (this.hoveredBuilding && this.hoveredBuilding.name !== this.clickedBuilding?.name) {
                console.log('updating clicked building')
                this.previousClicked = this.clickedBuilding
                this.clickedBuilding = this.hoveredBuilding

                // console.log(this.clickedBuilding);
                console.log("Building clicked")

                const points = createArrayOfPointsFromGroup(this.clickedBuilding)

                const boundingBoxHelper = this.createBoundingBox(points)

                this.pointsByNormal = this.groupPointsByNormal(boundingBoxHelper.geometry, boundingBoxHelper)

                // this.updateTransformControl()
                const buildingMaterial = this.materialHelper.getBuildingMaterial(
                    this.clickedBuilding,
                    this.materialHelper.materialMap[this.experience.currentMode],
                    this.experience.currentMode
                )
                updateChildrenMaterial(this.clickedBuilding, this.materialHelper.materialMap[this.experience.currentMode].click)
                updateChildrenMaterial(this.previousClicked, buildingMaterial)
            }
        })
    }
    callGetFacadesForClickedBuilding() {
        const basePoint = this.pointsByNormal.get('[0,-1,0]')

        console.log({basePoint})
        console.log("Clicked building height:", this.clickedBuildingHeight)

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

    sortPointsClockwise(points) {
        // Compute the centroid of the four points
        const centroid = new THREE.Vector3();
        points.forEach(p => centroid.add(p));
        centroid.divideScalar(points.length);
    
        // Choose a reference normal (assume polygon is mostly in one plane)
        const normal = new THREE.Vector3();
        const v1 = new THREE.Vector3().subVectors(points[1], points[0]);
        const v2 = new THREE.Vector3().subVectors(points[2], points[0]);
        normal.crossVectors(v1, v2).normalize(); // Normal of the polygon plane
    
        // Choose a reference axis (X-axis) in the plane
        const referenceAxis = new THREE.Vector3().subVectors(points[0], centroid).normalize();
    
        // Sort by angle relative to the reference axis
        points.sort((a, b) => {
            const va = new THREE.Vector3().subVectors(a, centroid).normalize();
            const vb = new THREE.Vector3().subVectors(b, centroid).normalize();
    
            // Compute cross and dot products
            const cross = new THREE.Vector3().crossVectors(referenceAxis, va);
            const dot = referenceAxis.dot(va);
    
            // Compute angle using atan2 for correct ordering
            const angleA = Math.atan2(cross.dot(normal), dot);
    
            const crossB = new THREE.Vector3().crossVectors(referenceAxis, vb);
            const dotB = referenceAxis.dot(vb);
            const angleB = Math.atan2(crossB.dot(normal), dotB);
    
            return angleA - angleB; // Sort counterclockwise
        });
    
        return points;
    }

    callGetFacadesForClickedBuildingV2AsTiles() {
        const basePoint = this.pointsByNormal.get('[0,-1,0]')

        console.log({basePoint})
        console.log("Clicked building height:", this.clickedBuildingHeight)
        let points = basePoint.map(b => new THREE.Vector3(b[0],b[1],b[2]))
        points = this.sortPointsClockwise(points)
        
        console.log("Angle to faces are actually roatated with 90deg.")
        /// Computing viewing angles for each side:
        for (let i=0; i<4; i++){
            // console.log(points[i], points[(i+1) % 4])
            let p1 = points[i]
            let p2 =  points[(i+1) % 4]

            // Compute direction vector
            // const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const direction = new THREE.Vector3().subVectors(p1, p2).normalize();

            // Choose a reference up vector (avoid collinear cases)
            const worldUp = new THREE.Vector3(0, 1, 0);
            if (Math.abs(direction.dot(worldUp)) > 0.99) {
                // If collinear, choose another reference
                worldUp.set(1, 0, 0);
            }

            // Compute perpendicular right vector
            const right = new THREE.Vector3().crossVectors(worldUp, direction).normalize();

            // Compute new "up" vector to maintain orthogonality
            const up = new THREE.Vector3().crossVectors(direction, 1).normalize();

            // Create rotation matrix
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeBasis(right, up, direction); // Aligns with p1->p2

            // Extract Euler angles (optional)
            const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix, 'YXZ');
            const rotX = THREE.MathUtils.radToDeg(euler.x);
            const rotY = THREE.MathUtils.radToDeg(euler.y);
            const rotZ = THREE.MathUtils.radToDeg(euler.z);

            // Output
            console.log(`Side: [${p1.x}, ${p1.y}, ${p1.z}] - [${p2.x}, ${p2.y}, ${p2.z}]`, "Perpendicular orientation:", rotX, rotY, rotZ);

            /* Spherical Coordinates:
            // Compute direction from p1 to p2
            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();

            // Compute a perpendicular vector in the XZ plane (assuming Y-up)
            const up = new THREE.Vector3(0, 1, 0);  // World up
            const perpendicular = new THREE.Vector3().crossVectors(direction, up).normalize();

            // Convert perpendicular direction to spherical coordinates
            const spherical = new THREE.Spherical().setFromVector3(perpendicular);

            const theta = THREE.MathUtils.radToDeg(spherical.theta); // Yaw angle (horizontal)
            const phi = THREE.MathUtils.radToDeg(spherical.phi); // Pitch angle (vertical)

            console.log(`Side [${p1.x},${p1.y},${p1.z}] - [${p2.x},${p2.y},${p2.z}]  has: Theta (Yaw): ${theta} degrees, Phi (Pitch): ${phi} degrees`);
            ////////
            */
        }

        

        this.visibilityEncoderService.predictFacadeFromBasePointsV2AsTiles(basePoint, this.clickedBuildingHeight)
            .then(res => {
                console.log(res.data)
                console.log("Displaying the building tiles...")
                // this.particleHelper.resetResultPoints()
                // this.particleHelper.plotParticlesForVisibilityEnconderResult(res.data)
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

        for (let i = 0; i < position.array.length; i += 3) {
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
            vertex.fromBufferAttribute(position, i / 3)
            boxHelper.localToWorld(vertex)
            vertex.toArray(positionCoord)

            if (!pointsByNormal.has(JSON.stringify(normalCoord))) {
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


        this.transformControl.attach(this.clickedBuilding)
    }
    setTransformControl() {
        this.transformControl = new TransformControls(this.camera.instance, this.experience.renderer.instance.domElement)
        this.transformControl.setMode('scale')
        this.experience.scene.add(this.transformControl)

        window.addEventListener('keydown', (event) => {
            switch (event.keyCode) {

                case 87: // W
                    this.transformControl.setMode('translate')
                    break


                case 82: // R
                    this.transformControl.setMode('scale')
                    break

                case 27: // Esc
                    this.transformControl.reset()
                    break

            }

        })
    }

    createBoundingBox(points) {
        const obb = new YUKA.OBB().fromPoints(points)
        this.helper = createOBBHelper(obb)

        console.log(this.helper)
        console.log(obb)
        console.log("Created Bonding boxes")

        this.clickedBuildingHeight = obb.halfSizes.y * 2
        this.clickedBuildingCenter = obb.center

        this.previousBoundingBox = this.currentBoundingBox
        this.currentBoundingBox = this.helper

        this.experience.scene.add(this.helper)

        this.previousBoundingBox?.geometry.dispose()
        this.previousBoundingBox?.material.dispose()
        this.experience.scene.remove(this.previousBoundingBox)

        return this.helper
    }
    createSlidingBoundingBox(points) {
        const obb = new YUKA.OBB().fromPoints(points)
        this.helper = createOBBHelper(obb)
        const { geometry } = this.helper
        console.log(geometry)

        this.numSegments = Math.ceil(geometry.parameters.height / 5)
        this.currentSeg = 1
        this.geometry = geometry

        let lowestY = Infinity, highestY = -Infinity
        for (let i = 0; i < points.length; i++) {
            lowestY = Math.min(lowestY, points[i].y)
            highestY = Math.max(highestY, points[i].y)
        }
        console.log({ lowestY, highestY })

        this.maxHeight = highestY
        this.helper.position.y = lowestY
        console.log('maxH: ' + this.maxHeight)
        console.log('posY' + this.helper.position.y)
        this.heightStep = (this.maxHeight - this.helper.position.y) / this.numSegments

        this.buildingCameraPositions = []
        this.updateSegment(
            Math.ceil(geometry.parameters.width / 10),
            Math.ceil(geometry.parameters.depth / 10),
        )

        console.log(this.helper)
        console.log(obb)

        this.previousBoundingBox = this.currentBoundingBox
        this.currentBoundingBox = this.helper

        // this.experience.scene.add( this.helper )

        this.previousBoundingBox?.geometry.dispose()
        this.previousBoundingBox?.material.dispose()
        this.experience.scene.remove(this.previousBoundingBox)
    }

    updateSegment(widthSegments, depthSegments) {
        if (this.currentSeg > this.numSegments) {
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
        const positions = this.helper.geometry.getAttribute('position')
        const normals = this.helper.geometry.getAttribute('normal')
        const topSidePositions = []

        for (let i = 0; i < positions.array.length; i += 3) {
            let index = i / 3

            const normal = new THREE.Vector3()
            normal.fromBufferAttribute(normals, index)

            if (
                normal.x == 0 &&
                normal.y == 1 &&
                normal.z == 0
            ) {
                const vertex = new THREE.Vector3()
                vertex.fromBufferAttribute(positions, index)
                this.helper.localToWorld(vertex)

                topSidePositions.push(vertex.toArray())
            }
        }

        this.currentSeg++
        this.buildingCameraPositions.push(...topSidePositions)
        this.updateSegment(widthSegments, depthSegments)
    }
    screenShotBuilding() {
        if (!this.buildingCameraPositions?.length) {
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
        this.gui.dataGenerationFolder.add({
            screenShotSelectedBuilding: () => {
                this.screenShotBuilding()
            }
        }, 'screenShotSelectedBuilding')

        this.gui.dataGenerationFolder.add({
            plotRadiusSCPosition: () => {
                this.plotRadiusScreenshotPositions()
            }
        }, 'plotRadiusSCPosition')

        this.gui.endpointsFolder.add({
            callGetFacadesForClickedBuilding: () => {
                this.callGetFacadesForClickedBuilding()
            }
        }, 'callGetFacadesForClickedBuilding')

        this.gui.endpointsFolder.add({
            callGetFacadesForClickedBuildingV2AsTiles: () => {
                this.callGetFacadesForClickedBuildingV2AsTiles()
            }
        }, 'callGetFacadesForClickedBuildingV2AsTiles')


        this.gui.endpointsFolder.add({
            callTestEnconderOnData: () => {
                this.callTestEnconderOnData()
            }
        }, 'callTestEnconderOnData')

    }
    update() {
        // verificar camera bugada, entender onde estou atualizando-a e onde falho em chamar updates
        this.instance.setFromCamera(this.mouse, this.camera.instance)
        const locationParticles = this.experience.queryLocationParticles ? this.experience.queryLocationParticles : [];
        const intersects = this.instance.intersectObjects([...this.buildingMeshes])
        const intersectsParticle = this.instance.intersectObjects([...locationParticles])
        this.hoveredBuilding = intersects[0]?.object?.parent
        this.hoveredParticle = intersectsParticle[0]?.object
    }
}