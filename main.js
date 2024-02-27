import { ResizeSystem } from '/common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '/common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from '/common/engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '/common/engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from '/common/engine/controllers/FirstPersonController.js';

import { Camera, Model } from '/common/engine/core.js';

import { startTimer } from './TimeLeft.js';
import { setPinState } from '/common/engine/controllers/FirstPersonController.js';
import { setSecState } from '/common/engine/controllers/FirstPersonController.js';

let st = new Audio("./common/sounds/soundtrack.opus");
let access_granted = new Audio("./common/sounds/access_granted.mp3");
let access_denied = new Audio("./common/sounds/incorrect_buzzer.mp3");
let item_equip = new Audio("./common/sounds/item_equip.mp3");

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '/common/engine/core/MeshUtils.js';

import { Physics } from './Physics.js';

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('scene/CorrectMap.gltf');

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');
camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.2, -1.2, -0.2],
    max: [0.2, 0.2, 0.2],
};

loader.loadNode('CHAIR').isStatic = true;
loader.loadNode('MONITOR').isStatic = true;
loader.loadNode('SCREENS').isStatic = true;
loader.loadNode('SECURITYDOOR12').isStatic = true;

const floor = loader.loadNode('floor1:pCube1')
const cam_screens = loader.loadNode('SCREENS2')
const desk = loader.loadNode('DESK')
const sec_door = loader.loadNode('SECURITYDOOR1')
const sec_door2 = loader.loadNode('SECURITYDOOR2')
const keypad = loader.loadNode('lock')
const exit = loader.loadNode('DOORWALL')
const vacuum = loader.loadNode('vacuum')
floor.isStatic = true;
floor.name = 'Floor'
vacuum.isStatic = true;
vacuum.name = 'Vacuum'
cam_screens.isStatic = true;
cam_screens.name = 'CameraScreens'
desk.isStatic = true;
desk.name = 'Desk'
sec_door.isStatic = true;
sec_door.name = 'SecurityDoor'
sec_door2.isStatic = true;
sec_door2.name = 'SecurityDoor2'
keypad.isStatic = true;
keypad.name = 'Keypad'
exit.isStatic = true;
exit.name = 'Exit'

// Pictures Big
let big_pictures = []
let small_pictures = []
for(let i = 0; i<8; i++){
    big_pictures.push(loader.loadNode(`PictureBigg${i+1}`))
}
for(let i=0; i<big_pictures.length; i++){
    big_pictures[i].isStatic = true;
    big_pictures[i].isEquipped = false;
    big_pictures[i].name = `BigPicture${i+1}`
    big_pictures[i].value = roundToNearestThousand(getRandomValue(75000, 250000))
}

// Pictures Small
for(let i = 0; i<20; i++){
    small_pictures.push(loader.loadNode(`PictureSmall${i+1}`))
}
for(let i=0; i<small_pictures.length; i++){
    small_pictures[i].isStatic = true;
    small_pictures[i].isEquipped = false;
    small_pictures[i].name = `SmallPicture${i+1}`
    small_pictures[i].value = roundToNearestThousand(getRandomValue(75000, 250000))
}

// Walls
loader.loadNode('WALLBIG8').isStatic = true;
loader.loadNode('WALLBIG16').isStatic = true;
loader.loadNode('WALLBIG17').isStatic = true;
loader.loadNode('WALLBIG18').isStatic = true;
loader.loadNode('WALLBIG19').isStatic = true;
loader.loadNode('WALLSMALL1').isStatic = true;
loader.loadNode('WALLSMALL2').isStatic = true;
loader.loadNode('WALLSMALL3').isStatic = true;
loader.loadNode('WALLSMALL5').isStatic = true;
loader.loadNode('WALLSMALL6').isStatic = true;
loader.loadNode('WALLSMALL11').isStatic = true;
loader.loadNode('WALLSMALL17').isStatic = true;
loader.loadNode('WALLSMALL21').isStatic = true;
loader.loadNode('WALLSMALL22').isStatic = true;
loader.loadNode('WALLSMALL23').isStatic = true;
loader.loadNode('WALLSMALL24').isStatic = true;
loader.loadNode('WALLSMALL25').isStatic = true;
loader.loadNode('WALLSMALL26').isStatic = true;
loader.loadNode('WALLSMALL27').isStatic = true;
loader.loadNode('WALLSMALL28').isStatic = true;
loader.loadNode('WALLSMALL29').isStatic = true;
loader.loadNode('WALLSMALL30').isStatic = true;
loader.loadNode('WALLSMALL31').isStatic = true;

loader.loadNode('bench1').isStatic = true;
loader.loadNode('bench2').isStatic = true;
loader.loadNode('bench3').isStatic = true;
loader.loadNode('bench4').isStatic = true;
loader.loadNode('bench5').isStatic = true;
loader.loadNode('bench6').isStatic = true;
loader.loadNode('bench7').isStatic = true;
loader.loadNode('bin1').isStatic = true;
loader.loadNode('bin2').isStatic = true;
loader.loadNode('bin3').isStatic = true;
loader.loadNode('fence1').isStatic = true;
loader.loadNode('fence2').isStatic = true;
loader.loadNode('fence3').isStatic = true;
loader.loadNode('fence4').isStatic = true;
loader.loadNode('fence5').isStatic = true;
loader.loadNode('fence6').isStatic = true;

loader.loadNode('plant1').isStatic = true;
loader.loadNode('plant2').isStatic = true;
loader.loadNode('plant3').isStatic = true;
loader.loadNode('plant4').isStatic = true;
loader.loadNode('plant5').isStatic = true;
loader.loadNode('plant6').isStatic = true;
loader.loadNode('plant7').isStatic = true;
loader.loadNode('plant8').isStatic = true;
loader.loadNode('plant9').isStatic = true;
loader.loadNode('plant10').isStatic = true;
loader.loadNode('plant11').isStatic = true;
loader.loadNode('plant12').isStatic = true;
loader.loadNode('plant13').isStatic = true;

loader.loadNode('sofa1').isStatic = true;
loader.loadNode('sofa2').isStatic = true;
loader.loadNode('sofa3').isStatic = true;
loader.loadNode('sofa4').isStatic = true;
loader.loadNode('sofa5').isStatic = true;

loader.loadNode('scannerLeft').isStatic = true;
loader.loadNode('scannerRight').isStatic = true;
loader.loadNode('servers').isStatic = true;
loader.loadNode('securitycam1').isStatic = true;
loader.loadNode('securitycam2').isStatic = true;
loader.loadNode('securitycam3').isStatic = true;
loader.loadNode('securitycam4').isStatic = true;
loader.loadNode('securitycam5').isStatic = true;
loader.loadNode('securitycam6').isStatic = true;
loader.loadNode('wendingmachine').isStatic = true;
loader.loadNode('pcmousekeyboard').isStatic = true;

const physics = new Physics(scene);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }
    
    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
    if(node.name == 'Vacuum'){
        node.aabb.max = [27, 27, 50]
        node.aabb.min = [-27, -27, -50]
    }
});

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function roundToNearestThousand(number) {
    return Math.round(number / 1000) * 1000;
}
function randomSpawn(character){
    const minValue = -10;
    const maxValue = 3;
    const randomValueX = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    const randomValueZ = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    character.components[0].translation[0] = randomValueX;
    character.components[0].translation[2] = randomValueZ;
}

export function toggleLetterOverlay() {
    const overlay = document.getElementById('letter');
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
}

const kpOverlay = document.getElementById('keypad');
const inputField = document.getElementById('inputField');
const mOverlay = document.getElementById('monitor');
const inputTerm = document.getElementById('terminalInput');

export function toggleKeypadOverlay() {
    kpOverlay.style.display = kpOverlay.style.display === 'none' ? 'block' : 'none';
    inputField.focus();
    inputField.addEventListener('input', handleKeypadInput);
}

function handleKeypadInput(){
    const enteredCode = inputField.value;
    if(enteredCode == 'e')
        inputField.value = "";
    if (enteredCode.length >= 6) {
        if(enteredCode == "489716"){
            access_granted.volume = 0.4;
            access_granted.play();
            kpOverlay.style.display = kpOverlay.style.display === 'none' ? 'block' : 'none';
            setPinState()
            inputField.removeEventListener('input', handleKeypadInput)
            inputField.value = "";
        } else {
            access_denied.volume = 0.2;
            access_denied.play();
            inputField.value = "";
            inputField.removeEventListener('input', handleKeypadInput)
            kpOverlay.style.display = kpOverlay.style.display === 'none' ? 'block' : 'none';
        }
    }
}

export function toggleMonitorScreen() {
    mOverlay.style.display = mOverlay.style.display === 'none' ? 'block' : 'none';
    inputTerm.focus();
    inputTerm.addEventListener('input', handleTerminalInput);
}

function handleTerminalInput(){
    const enteredCommand = inputTerm.value;
    if(enteredCommand == 'e')
        inputTerm.value = "";
    if(enteredCommand == 'open secdoor disable surv'){
        mOverlay.style.display = mOverlay.style.display === 'none' ? 'block' : 'none';
        setSecState()
        inputTerm.removeEventListener('input', handleTerminalInput)
        inputTerm.value = "";
    }
}

export function soundtrack() {
    st.loop = true;
    st.volume = 0.2;
    st.play();
}

canvas.addEventListener('click', e => startTimer());
