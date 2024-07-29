import * as THREE from 'three'

import Experience from './Experience'
import { AMORTIZE_SPEED_X, AMORTIZE_SPEED_Y, AMORTIZE_SPEED_Z, KeyCode, MAX_HEIGHT, MIN_HEIGHT } from './Utils/constants'

export default class CharacterControls {
    constructor() {
        this.experience = new Experience()
        this.controls = this.experience.camera.controls
        this.time = this.experience.time

        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()

        this.moveRight = false
        this.moveLeft = false
        this.moveForward = false
        this.moveBackward = false
        this.moveUpwards = false
        this.moveDownwards = false
        this.isPaused = false
        this.controls.isLocked = false
        this.outsideLock = false

        this.setControlledCameraEvents()
    }

    setControlledCameraEvents() {
        window.addEventListener( 'keydown', (e) => this.onKeyPress(e, true) )
        window.addEventListener( 'keyup', (e) => this.onKeyPress(e, false) )
        window.addEventListener('mousedown', (e) => this.onMousePress(e, true) )
        window.addEventListener('mouseup', (e) => this.onMousePress(e, false) )
    }

    onKeyPress(event, isPressed) {
        switch ( event.code ) {
        case KeyCode.ARROW_UP:
        case KeyCode.W:
            this.moveForward = isPressed
            // setKeyPressActivity(event.code);
            break
    
        case KeyCode.ARROW_LEFT:
        case KeyCode.A:
            this.moveLeft = isPressed
            // setKeyPressActivity(event.code);
            break
    
        case KeyCode.ARROW_DOWN:
        case KeyCode.S:
            this.moveBackward = isPressed
            // setKeyPressActivity(event.code);
            break
    
        case KeyCode.ARROW_RIGHT:
        case KeyCode.D:
            this.moveRight = isPressed
            // setKeyPressActivity(event.code);
            break
            
        case KeyCode.Z:
            this.moveUpwards = isPressed
            // setKeyPressActivity(event.code);
            break
            
        case KeyCode.X:
            this.moveDownwards = isPressed
            // setKeyPressActivity(event.code);
            break
            
        case KeyCode.ESC:
            if(!isPressed) {
                this.togglePauseMode()
            }
            break
        }
    }
    
    onMousePress(event, isPressed) {
        if(this.outsideLock) {
            this.controls.isLocked = false
        } else if(!this.isPaused) {
            if(isPressed) {
                this.controls.isLocked = true
            } else {
                // activityMap.mouse++;
                this.controls.isLocked = false
            }
        }
    }

    togglePauseMode() {
        this.isPaused= !this.isPaused
        // if(isPaused) {
        //     blocker.style.display = 'block';
        //     instructions.style.display = '';
        //     endGame.style.display = 'none';
    
        // } else {
        //     instructions.style.display = 'none';
        //     blocker.style.display = 'none';
        //     endGame.style.display = 'none';
        // }
    }

    getUpdatedY(adjustedDelta) {
        const previousY = this.controls.getObject().position.y
        const updatedY = previousY + ( -this.velocity.y * adjustedDelta )
        
        return Math.min(Math.max(updatedY, MIN_HEIGHT), MAX_HEIGHT)
    }

    update() {
        const adjustedDelta = this.time.delta/1000
        
        this.velocity.x -= this.velocity.x * AMORTIZE_SPEED_X * adjustedDelta
        this.velocity.y -= this.velocity.y * AMORTIZE_SPEED_Y * adjustedDelta
        this.velocity.z -= this.velocity.z * AMORTIZE_SPEED_Z * adjustedDelta

        this.direction.x = Number( this.moveRight ) - Number( this.moveLeft )
        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward )
        this.direction.y = Number( this.moveUpwards ) - Number( this.moveDownwards )
        this.direction.normalize()

        if ( this.moveLeft || this.moveRight ) {
            this.velocity.x -= this.direction.x * 400.0 * adjustedDelta
        }
        if ( this.moveForward || this.moveBackward ) {
            this.velocity.z -= this.direction.z * 400.0 * adjustedDelta
        }
        if ( this.moveUpwards || this.moveDownwards ) {
            this.velocity.y -= this.direction.y * 400.0 * adjustedDelta
        }
       
        if(!this.isPaused) {
            this.controls.moveRight( - this.velocity.x * adjustedDelta )
            this.controls.moveForward( - this.velocity.z * adjustedDelta )
            this.controls.getObject().position.y = this.getUpdatedY(adjustedDelta)
        }
    }
}