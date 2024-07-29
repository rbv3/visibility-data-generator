import Experience from "./Experience"
import * as THREE from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { getDistance3D, getVertex, normalize3DCoord, subtractVectors } from "./Utils/helpers";

export default class BirdsEye {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.camera = this.experience.camera
        this.controls = this.experience.characterControls
        this.scene = this.experience.scene
        this.gui = this.experience.gui

        this.plane = null;

        this.setTransformControls()
        this.setGUI()
    }

    setBirdsEyeCamera() {
        const cameraPosition = [
            1222.9460847744015,
            483.0482763224882,
            -4474.680415156037
        ]
        const cameraRotation = [
            THREE.MathUtils.degToRad(-174.4967106570212), 
            THREE.MathUtils.degToRad(-1.8555140622514954), 
            THREE.MathUtils.degToRad(-179.82125863104804)
        ]
        const cameraFar = 7500

        this.camera.instance.position.set(...cameraPosition)
        this.camera.instance.rotation.set(...cameraRotation)
        this.camera.instance.far = cameraFar
        this.camera.instance.updateProjectionMatrix()
    }

    addPlane() {
        const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1)
        geometry.rotateX(Math.PI * 0.5)

        const material = new THREE.MeshBasicMaterial({
            color: 'red',
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            wireframe: true
        })
        this.plane = new THREE.Mesh(geometry, material)
        this.transformControls.attach(this.plane)

        this.scene.add(this.plane)
    }

    getPlaneDirections() {
        const directions = []
        const planePosition = this.plane.geometry.attributes.position.array

        let AB, AC, AD
        let p0, p1, p2, p3

        p0 = getVertex(planePosition, 0)
        p1 = getVertex(planePosition, 1)
        p2 = getVertex(planePosition, 2)
        p3 = getVertex(planePosition, 3)

        AB = subtractVectors(p0, p1)
        AC = subtractVectors(p0, p2)
        AD = subtractVectors(p0, p3)

        let distAB, distAC, distAD
        distAB = getDistance3D(p0, p1)
        distAC = getDistance3D(p0, p2)
        distAD = getDistance3D(p0, p3)
        const distances = [distAB, distAC, distAD]

        const maxDistance = Math.max(...distances)
        if(distAB != maxDistance) {
            directions.push(normalize3DCoord(AB))
        }
        if(distAC != maxDistance) {
            directions.push(normalize3DCoord(AC))
        }
        if(distAD != maxDistance) {
            directions.push(normalize3DCoord(AD))
        }

        return directions
    }


    setTransformControls() {
        this.transformControls = new TransformControls( this.camera.instance, this.canvas );

        this.scene.add(this.transformControls)
        this.transformControls.addEventListener( 'dragging-changed', (event) => {
            this.controls.outsideLock = event.value
        } );

        window.addEventListener( 'keydown', (event) => {
            switch (event.key) {
                case 't':
                    this.transformControls.setMode( 'translate' );
                    break;

                case 'r':
                    this.transformControls.setMode( 'rotate' );
                    break;

                case 'y':
                    this.transformControls.setMode( 'scale' );
                    break;

            }

        } );
    }

    setGUI() {
        this.gui.birdsEyeFolder.add({
            setBirdsEyeCamera: () => {
                this.setBirdsEyeCamera()
            }
        }, 'setBirdsEyeCamera')
        this.gui.birdsEyeFolder.add({
            addPlane: () => {
                this.addPlane()
            }
        }, 'addPlane')
        this.gui.birdsEyeFolder.add({
            logPlane: () => {
                if(this.plane != null) {
                    console.log(this.plane)
                }
                this.getPlaneDirections()
            }
        }, 'logPlane')
    }
}
