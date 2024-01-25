window.addEventListener('load', initApp);

const { cameraAPI } = SDK3DVerse.engineAPI;

let canvas;
let clickCounter = 0;
let btnToggleViewports;
let btnToggleControllerType;
let initialControllerSettings;

// The viewport configurations
const soloViewportConfig = {
    id: 0,
    top: 0, left: 0,
    width: 1, height: 1,
    defaultControllerType: SDK3DVerse.controller_type.editor,
    // Set the initial camera speed based on the whole scene bounding box.
    // You can set an arbitrary float value in meters per second.
    defaultCameraSpeed: 'auto'
};
const leftViewportConfig = {
    id: 1,
    top: 0, left: 0,
    width: 0.5, height: 1,
    defaultControllerType: SDK3DVerse.controller_type.editor,
};
const rightViewportConfig = {
    id: 2,
    top: 0, left: 0.5,
    width: 0.5, height: 1,
    defaultControllerType: SDK3DVerse.controller_type.orbit,
};
const dualViewportConfig = [leftViewportConfig, rightViewportConfig];

// The 3dverse camera controller types
const controllerTypes = SDK3DVerse.controller_type;

// Entrypoint
async function initApp() {
    btnToggleViewports = document.getElementById("btn-toggle-viewports");
    btnToggleControllerType = document.getElementById("btn-toggle-controller-type");
    canvas = document.getElementById('display-canvas');

    // Join or start a new session on 3dverse
    await SDK3DVerse.joinOrStartSession({
        userToken: 'PUBLIC_TOKEN',
        sceneUUID: 'SCENE_UUID',
        canvas,
        viewportProperties: soloViewportConfig,
    });

    // Bindings to lock the mouse pointer
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitPointerLockElement;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);

    // Copy the initial controller settings
    initialControllerSettings = { ...cameraAPI.controllerSettings };

    // Set the initial state of the UI
    const currentControllerType = cameraAPI.getViewports()[0].getControllerType();
    btnToggleControllerType.innerText = getControllerTypeName(currentControllerType);

    const viewports = cameraAPI.getViewports();
    const isSoloViewport = viewports.length === 1;
    btnToggleViewports.innerText = isSoloViewport ? 'Solo viewport' : 'Dual viewports';
}

const onMouseDown = () => {
    // Increase a counter to keep track of how many mouse buttons are held
    clickCounter++;
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousemove', onMouseMove);
};
const onMouseMove = () => {
    // Lock the mouse pointer to make mouse pointer disappear
    // as soon as the mouse has moved with a mouse button held down
    canvas.requestPointerLock();
    canvas.removeEventListener('mousemove', onMouseMove);
};
const onMouseUp = () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    // Exit the mouse pointer lock to make it appear back once all mouse buttons are released
    if(clickCounter > 0 && --clickCounter === 0) {
        document.exitPointerLock();
    }
};

window.toggleViewports = async function() {
    const viewports = cameraAPI.getViewports();
    const isSoloViewport = viewports.length === 1;
    const viewportsConfig = isSoloViewport ? dualViewportConfig : [soloViewportConfig];
    btnToggleViewports.innerText = !isSoloViewport ? 'Solo viewport' : 'Dual viewports';
    console.log('Change viewports:', viewportsConfig);
    await cameraAPI.setViewports(viewportsConfig);
}

// Increase the camera controller speed
window.faster = function() {
    let { speed } = cameraAPI.controllerSettings;
    speed *= 2;
    console.log('Faster speed: '+ speed);
    cameraAPI.updateControllerSettings({ speed });
}

// Deecrease the camera controller speed
window.slower = function() {
    let { speed } = cameraAPI.controllerSettings;
    speed /= 2;
    console.log('Slower speed: '+ speed);
    cameraAPI.updateControllerSettings({ speed });
}

// Increase the camera controller sensitivity
window.moreSensitive = function() {
    let { sensitivity } = cameraAPI.controllerSettings;
    sensitivity *= 2;
    console.log('More sensitive: '+ sensitivity);
    cameraAPI.updateControllerSettings({ sensitivity });
}

// Decrease the camera controller sensitivity
window.lessSensitive = function() {
    let { sensitivity } = cameraAPI.controllerSettings;
    sensitivity /= 2;
    console.log('Less sensitive: '+ sensitivity);
    cameraAPI.updateControllerSettings({ sensitivity });
}

// Reset the transform and the camera controller settings for each active viewport
window.resetAll = async function() {
    const viewports = cameraAPI.getViewports();
    const travelingDurationInSec = 2;

    // an example about how to iterate on an array to call async tasks
    // and then await on all those tasks.
    const asyncResetOperations = [];
    viewports.forEach(viewport => {
        console.log('Reset transform for viewport with id=' + viewport.getId());

        // Reset viewport needs to recreate the camera controller.
        // The operation must be delayed to be performed on several viewports at once.
        setTimeout(() => {
            asyncResetOperations.push(viewport.resetTransform(travelingDurationInSec));
        }, 100 * viewport.getId());
        // Follwoing does not work e.g viewport 1 (the left one of the dual viewport config) is not reset
        //asyncResetOperations.push(viewport.resetTransform());
    });
    await Promise.all(asyncResetOperations);

    console.log('Reset controller settings:', initialControllerSettings);
    cameraAPI.updateControllerSettings(initialControllerSettings);
}

// Toggle the current viewport controller type
window.toggleCurrentViewportControllerType = function() {
    const viewports = cameraAPI.getViewports();
    viewports.forEach(viewport => {
        const { editor, orbit } = controllerTypes;
        const controllerType = viewport.getControllerType() === editor ? orbit : editor;
        console.log(`Set controller type ${getControllerTypeName(controllerType)} for viewport with id=` + viewport.getId());
        viewport.setControllerType(controllerType);
        btnToggleControllerType.innerText = getControllerTypeName(controllerType);
    });
}

// Helper function to get the name of a controller type
function getControllerTypeName(controllerType) {
    const controllerTypesValues = Object.values(controllerTypes);
    const controllerTypesKeys = Object.keys(controllerTypes);
    return controllerTypesKeys[controllerTypesValues.indexOf(controllerType)];
}