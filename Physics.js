import { vec3, mat4 } from '/lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '/common/engine/core/SceneUtils.js';
import { Transform } from '/common/engine/core.js';

import { showValue } from '/TimeLeft.js'
import { setState } from './common/engine/controllers/FirstPersonController.js';
import { setKeypadState } from './common/engine/controllers/FirstPersonController.js';
import { setDeskState } from './common/engine/controllers/FirstPersonController.js';

let currentAxis = 2
let move_factor = -0.003
let time_freeze = -1000000;
let time_freeze2 = -1000000;

export class Physics {

    constructor(scene) {
        this.scene = scene;
    }

    update(t, dt) {
        this.scene.traverse(node => {
            if (node.isDynamic) {
                this.scene.traverse(other => {
                    if (node !== other && other.isStatic) {
                        this.resolveCollision(node, other);
                    }
                });
            }
            
            if (node.name == 'Vacuum'){
                this.scene.traverse(other => {
                    if(other.name && other.name.includes('Picture'))
                        return
                    if (node !== other && other.isStatic && other.name != 'Floor' && other.name != 'Desk'
                        && other.name != 'Keypad' && other.name != 'CameraScreens' && other.name != 'SecurityDoor'
                        && other.name != 'Exit' && other.name != 'SecurityDoor2') {
                        let distance = this.calculateDistance(node, other)
                        if(distance >= 1.6 && distance < 1.9 && !(time_freeze+1.5 > t)){
                            time_freeze = t
                            this.changeDirection()
                        }
                        if(distance < 1.6 && !(time_freeze2+1.5 > t)){
                            time_freeze2 = t
                            if(move_factor < 0){
                                move_factor = Math.abs(move_factor)
                            }else {
                                move_factor = -1 * move_factor
                            }

                        }
                    }
                });
                this.moveVacuum(node)
            }
            
        });
        
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const matrix = getGlobalModelMatrix(node);
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, matrix));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    moveVacuum(vacuum){
        vacuum.components[0].translation[currentAxis] += move_factor
    }

    calculateDistance(point1, point2) {
        let a = point1.components[0].translation
        let b = point2.components[0].translation
        const squaredDifferences = a.map((coord, index) => Math.pow(coord - b[index], 2));
        const distance = Math.sqrt(squaredDifferences.reduce((sum, value) => sum + value, 0));
        return distance;
    }

    changeDirection(){
        if(currentAxis == 2)
            currentAxis = 0;
        else
            currentAxis = 2
    }

    resolveCollision(a, b) {
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);
        
        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding) {
            return;
        }

        // Show picture's value
        if(b.name && b.name.includes('Picture')){
            showValue(b.value)
            if(!b.isEquipped && a.children.length < 5)
                setState(b, b.value)
        }

        if(b.name && b.name == "Keypad"){
            setKeypadState()
        }

        if(b.name && b.name == "Desk"){
            setDeskState()
        }

        // Win
        if(b.name && b.name == "Exit" && a.totalValue >= 1000000){
            location.href = 'win.html'
        }

        // Lose
        if(b.name && b.name == "Exit" && a.totalValue < 1000000 && a.children.length == 5){
            location.href = 'loss.html'
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        const transform = a.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        vec3.add(transform.translation, transform.translation, minDirection);
    }

}
