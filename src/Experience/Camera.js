import * as THREE from 'three'
import Experience from './Experience.js'
import { CustomPointerLockControls } from './CustomPointerLockControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CAMERA_QUATERNIONS } from './Utils/constants.js'


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.gui = this.experience.gui
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas


        this.quaternionIndex = 0

        this.setInstance()
        this.setControls()

        this.setGUI()
    }
    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width/this.sizes.height,
            1,
            2500
        )
        this.instance.position.set(512, 100, 280)
        // this.instance.position.set(0, 100, 0)
        this.instance.lookAt(733, 55, 714) // random point on the lake

        // this.instance.position.set(337.87109375, -11.231389999389648,  -59.07550048828125)
        

        this.instance.quaternion.set(0, 0.2, 0, 1)
        this.instance.quaternion.set(...CAMERA_QUATERNIONS[this.quaternionIndex])
        this.scene.add(this.instance)
    }
    setControls() {
        this.controls = new CustomPointerLockControls(this.instance, this.canvas)
        this.controls.isLocked = true
    }
    setGUI() {
        this.gui.cameraFolder.add({getCameraPosition : () => {
            console.log(this.instance.position)
        }}, 'getCameraPosition')
        this.gui.cameraFolder.add({getCameraRotation : () => {
            console.log('Euler Viewing angles around the origin, not smooth with respect to sccene',
                THREE.MathUtils.radToDeg(this.instance.rotation._x),
                THREE.MathUtils.radToDeg(this.instance.rotation._y),
                THREE.MathUtils.radToDeg(this.instance.rotation._z),
            )
            // console.log("lookAt", this.instance.lookAt)
            console.log("position", this.instance.position)
  
            ///1. Position relative the scene center
            /*
            const cameraPosition = this.instance.position.clone();
            //Got scene center using - np.mean(buildings_vis_df[["x","y","z"]].values, axis=0)
            const targetPosition = new THREE.Vector3(1406.54009895,  161.69680881, 1061.20413751); // Scene center centroid

            // Vector from center to camera
            const vector = cameraPosition.sub(targetPosition);

            // Convert to spherical coordinates
            const spherical = new THREE.Spherical().setFromVector3(vector);

            // Extract angles in degrees
            const theta = THREE.MathUtils.radToDeg(spherical.theta); // Horizontal rotation (Y-axis)
            const phi = THREE.MathUtils.radToDeg(spherical.phi); // Vertical rotation (X-axis)

            console.log(`Rotation around scene center: theta = ${theta}, phi = ${phi}`);
            */
           ///2. Rotation relative the scene center
            const cameraDirection = new THREE.Vector3();
            this.instance.getWorldDirection(cameraDirection); // Get forward direction of camera

            // Compute angles in spherical coordinates
            const spherical = new THREE.Spherical().setFromVector3(cameraDirection);

            const theta = THREE.MathUtils.radToDeg(spherical.theta); // Horizontal viewing angle
            const phi = THREE.MathUtils.radToDeg(spherical.phi); // Vertical viewing angle

            console.log("Spherical:", spherical)

            console.log(`Spherical angles, Smooth relative to / around scene center: theta = ${theta}, phi = ${phi}`);

            
            // Centroid of the scene
            // const centroid = new THREE.Vector3(1406.54009895,  161.69680881, 1061.20413751);
            /////Further trials:
            // Camera position
            // Define the centroid of the scene
            // const centroid =  new THREE.Vector3(1406.54009895,  161.69680881, 1061.20413751); // Replace with actual centroid coordinates

            // Get camera's world rotation matrix
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.extractRotation(this.instance.matrixWorld);

            // Convert to Euler angles
            const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix, 'YXZ');

            // Convert radians to degrees
            const rotX = THREE.MathUtils.radToDeg(euler.x);
            const rotY = THREE.MathUtils.radToDeg(euler.y);
            const rotZ = THREE.MathUtils.radToDeg(euler.z);

            // Store in CSV
            console.log(`rotX, rotY, rotZ [${rotX},  ${rotY},  ${rotZ}]`);

            console.log("\n")

        }}, 'getCameraRotation')
        this.gui.cameraFolder.add({getCamera : () => {
            console.log(this.instance)
        }}, 'getCamera')
        
        this.gui.cameraFolder.add(this.instance, 'far').min(100).max(10000).onFinishChange(() => this.instance.updateProjectionMatrix())
    }
    updateQuaternion() {
        this.quaternionIndex += 1
        this.quaternionIndex %= CAMERA_QUATERNIONS.length
        this.instance.quaternion.set(...CAMERA_QUATERNIONS[this.quaternionIndex])
    }

    createSnapshotPositions() {
        // get differente between start and ending positions
        // divide the diff by X (prolly 10)
        // create a array that goes from start to the end by moving delta/X each time 
    }

    updatePosition() {
        // iterate through snapshotPositions
    }
    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    update() {
    }
}