window.addEventListener('load', initApp);
let canvas;
let clickCounter = 0;
async function initApp() {
    canvas = document.getElementById('display-canvas');
    await SDK3DVerse.joinOrStartSession({
        userToken: 'PUBLIC_TOKEN',
        sceneUUID: 'SCENE_UUID',
        canvas,
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.editor,
            //defaultControllerType: SDK3DVerse.controller_type.orbit,
        },
    });

    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitPointerLockElement;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
}

const onMouseDown = () =>
{
    // Increase a counter to keep track of how many mouse buttons are held
    clickCounter++;
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousemove', onMouseMove);
};
const onMouseMove = () =>
{
    // Lock the mouse pointer to make mouse pointer disappear
    // as soon as the mouse has moved with a mouse button held down
    canvas.requestPointerLock();
    canvas.removeEventListener('mousemove', onMouseMove);
};
const onMouseUp = () =>
{
    // Exit the mouse pointer lock to make it appear back once all mouse buttons are released
    if(clickCounter > 0 && --clickCounter === 0) {
        document.exitPointerLock();
    }
};

