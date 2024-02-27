import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { Transform } from '../core/Transform.js';

import { updateValue } from '/TimeLeft.js'
import { numberOfPicsStolen } from '/TimeLeft.js'
import { toggleLetterOverlay } from '../../../main.js'
import { toggleKeypadOverlay } from '../../../main.js'
import { toggleMonitorScreen } from '../../../main.js'

let door_open = new Audio("./common/sounds/door_open.mp3");
let door_open2 = new Audio("./common/sounds/door_open2.mp3");
let get_picture = new Audio("./common/sounds/item_equip.mp3");
let running_and_breathing = new Audio('./common/sounds/running_and_breathing.opus');
let running_and_breathingFast = new Audio('./common/sounds/running_and_breathingFast.opus');
let secsystem_disabled = new Audio("./common/sounds/secsystem_disabled.mp3");

let canEquip = false;
let canUnlockSecDoor = false;
let canUseComputer = false
let correctPin = false;
let correctCommand = false;
let picture;
let picture_value;
let kOverlay;
let mOverlay;
let isBusy = false;
let secdoor_open = false;
let secdoor2_open = false;

export function setState(pic, pic_value){
    canEquip = true
    picture = pic
    picture_value = pic_value
}

export function setKeypadState(){
    canUnlockSecDoor = true
}
export function setPinState(){
    correctPin = true;
}
export function setDeskState(){
    canUseComputer = true
}
export function setSecState(){
    correctCommand = true
}

export class FirstPersonController {

    constructor(node, domElement, {
        pitch = 0,
        yaw = 0,
        velocity = [0, 0, 0],
        acceleration = 50,
        maxSpeed = 3.5,
        decay = 0.99999,
        pointerSensitivity = 0.0014,
        exhausted = false,
        crouching = false,
        energy = 2000
    } = {}) {
        this.node = node;
        this.domElement = domElement;
        this.keys = {};
        this.pitch = pitch;
        this.yaw = yaw;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.energy = energy;
        this.exhausted = exhausted
        this.crouching = crouching
        this.pointerSensitivity = pointerSensitivity;
        this.node.totalValue = 0

        this.initHandlers();
    }

    initHandlers() {
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);

        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
            }
        });

        kOverlay = doc.getElementById('keypad');
        mOverlay = doc.getElementById('monitor');
    }

    update(t, dt) {

        if(kOverlay.style.display == 'block' || mOverlay.style.display == 'block')
            isBusy = true
        else
            isBusy = false
        // Calculate forward and right vectors.
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        const forward = [-sin, 0, -cos];
        const right = [cos, 0, -sin];
        
        // Map user input to the acceleration vector.
        const acc = vec3.create();
        this.maxSpeed = 3.5;
        if (this.keys['KeyW'] && !isBusy) {
            if(this.keys['ShiftLeft'] && !this.exhausted){
                this.maxSpeed = this.maxSpeed + 2.25;
                vec3.add(acc, acc, forward);
                running_and_breathing.pause();
                running_and_breathingFast.volume = 1;
                running_and_breathingFast.play();
            } else {
                running_and_breathingFast.pause()
                running_and_breathing.volume = 0.6;
                running_and_breathing.play();
                vec3.add(acc, acc, forward);
            }
        }
        if (this.keys['KeyS'] && !isBusy) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD'] && !isBusy) {
            if(this.keys['ShiftLeft'] && !this.keys['KeyW'] && !this.exhausted){
                this.maxSpeed = this.maxSpeed + 1.5;
                vec3.add(acc, acc, right);
            } else {
                vec3.add(acc, acc, right);
            }
        }
        if (this.keys['KeyA'] && !isBusy) {
            if(this.keys['ShiftLeft'] && !this.keys['KeyW'] && !this.exhausted){
                this.maxSpeed = this.maxSpeed + 1.5;
                vec3.sub(acc, acc, right);
            } else {
                vec3.sub(acc, acc, right);
            }
        }

        // Crouch
        if (this.keys['KeyC'] && !isBusy) {
            this.node.components[0].translation[1] = 0.6
            this.node.aabb.min[1] = -0.7
            this.maxSpeed = 1.5
            this.crouching = true
        } else {
            this.node.components[0].translation[1] = 1.25
            this.node.aabb.min[1] = -1.2
        }
        
        // Update velocity based on acceleration.
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

        // Sprinting
        if (this.energy <= 0) {
            this.exhausted = true;
            this.energy = 0;
        } else if (this.energy >= 0)
            this.exhausted = false;
        if (this.keys['ShiftLeft']) {
            if (this.exhausted === false && this.energy>=0) 
                this.energy = this.energy - 1.5;
        }else{
            if(this.exhausted === true || this.energy<=2000) 
                this.energy = this.energy + 1.75;
        }

        // Grab a picture
        if (this.keys['KeyE'] && canEquip) {
            get_picture.play()
            this.node.addChild(picture)
            picture.isEquipped = true
            picture.isStatic = false
            picture.components[0].translation = [0, -10, 0, 0]
            this.node.totalValue = this.node.totalValue + picture_value
            updateValue(this.node.totalValue)
            numberOfPicsStolen(this.node.children.length)
        }
        canEquip = false

        // Open Door to Security Room
        if(correctPin && !secdoor_open){
            let sec_door;
            let nodes = this.node.parent.children
            for(let i=0; i<nodes.length; i++){
                if(nodes[i].name == "SecurityDoor")
                    sec_door = nodes[i]
            }
            if(sec_door){
                secdoor_open = true;
                door_open2.play();
                sec_door.components[0].translation[1] = -3
            }
        }

        // Open Security Door and Disable Cameras
        if(correctCommand && !secdoor2_open){
            let sec_door2;
            let cam_screens;
            let nodes = this.node.parent.children
            for(let i=0; i<nodes.length; i++){
                if(nodes[i].name == "SecurityDoor2")
                    sec_door2 = nodes[i]
                if(nodes[i].name == "CameraScreens")
                    cam_screens = nodes[i]
            }
            if(sec_door2){
                secdoor2_open = true;
                door_open.volume = 1;
                door_open.play();
                sec_door2.components[0].translation[0] = 1.15
                secsystem_disabled.volume = 0.4;
                secsystem_disabled.play();
            }
            if(cam_screens)
                cam_screens.components[0].translation[0] = 4.04
        }

        // If there is no user input, apply decay.
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            running_and_breathing.volume = 0.4;
            running_and_breathingFast.volume = 0.6;
            setTimeout(function() {
                running_and_breathing.pause();
                running_and_breathingFast.pause();
            }, 800);
            const decay = Math.exp(dt * Math.log(1 - this.decay));
            vec3.scale(this.velocity, this.velocity, decay);
        }

        // Limit speed to prevent accelerating to infinity and beyond.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }

        const transform = this.node.getComponentOfType(Transform);
        if (transform) {
            // Update translation based on velocity.
            vec3.scaleAndAdd(transform.translation,
                transform.translation, this.velocity, dt);

            // Update rotation based on the Euler angles.
            const rotation = quat.create();
            quat.rotateY(rotation, rotation, this.yaw);
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.pointerSensitivity;
        this.yaw   -= dx * this.pointerSensitivity;

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;

        if (this.keys['KeyL'] && !isBusy) {
            toggleLetterOverlay()
        }

        // Show Keypad overlay
        if (this.keys['KeyE'] && canUnlockSecDoor) {
            toggleKeypadOverlay()
        }
        canUnlockSecDoor = false

        // Show Monitor Screen
        if (this.keys['KeyE'] && canUseComputer && !isBusy) { 
            toggleMonitorScreen()
        }
        canUseComputer = false

        if(this.keys['Enter']){
            if(kOverlay.style.display == 'block')
                toggleKeypadOverlay()
            if(mOverlay.style.display == 'block')
                toggleMonitorScreen()
        }
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

