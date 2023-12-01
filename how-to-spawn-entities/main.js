window.addEventListener('load', initApp);

// The scene that is spawned when clicking "Link Scene"
const sceneToLinkUUID = '49c0a2e9-d170-4d90-b757-5ccbaea12f84';
let linkedSceneEntity = null;
let lightEntity = null;

async function initApp() {
    await SDK3DVerse.joinOrStartSession({
        userToken: 'public__Stxwks57CH39bjP',
        sceneUUID: '30c5e730-129f-4749-a87f-e2b3fd76a209',
        canvas: document.getElementById('display-canvas'),
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.orbit,
        },
    });

    // Set camera settings to make the light entity more visible
    const cameraEntity = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getCamera();
    cameraEntity.setComponent('camera', {
        dataJSON: {
            // Disable reflection
            reflection: false,
            environment: {
                // Use gradient as environment
                skybox: false,
                atmosphere:false,
                gradient:true
            }
        }
    });

    // Set bottom gradient to black (top is white)
    SDK3DVerse.engineAPI.propagateSceneSettings({ environment: { ambientColorBottom: [0, 0, 0] } });

    // Spawn the light otherwise the cube is dark
    spawnLight();
}

window.spawnSceneLinker = async function() {
    if(linkedSceneEntity) {
        return;
    }

    let template = new SDK3DVerse.EntityTemplate();
    template.attachComponent('scene_ref', { value: sceneToLinkUUID });
    template.entityTemplate.local_transform.position = [0,0,-3];
    const deleteOnClientDisconnection = true;
    const parentEntity = null;
    linkedSceneEntity = await template.instantiateTransientEntity("linked scene name", parentEntity, deleteOnClientDisconnection);
}

window.deleteSceneLinker = async function() {
    if(!linkedSceneEntity) {
        return;
    }

    await SDK3DVerse.engineAPI.deleteEntities([linkedSceneEntity]);
    linkedSceneEntity = null;
}

window.spawnLight = async function() {
    if(lightEntity) {
        return;
    }

    let template = new SDK3DVerse.EntityTemplate();
    template.attachComponent('point_light', {
        color: [1, 0, 0],
        intensity: 50,
        range: 0,
        isDirectional: false,
        isSun: false
    });
    template.entityTemplate.local_transform.position = [1.5, 1.5, 0.75];
    const deleteOnClientDisconnection = true;
    const parentEntity = linkedSceneEntity;
    lightEntity = await template.instantiateTransientEntity("light name", parentEntity, deleteOnClientDisconnection);
}

window.deleteLight = async function() {
    if(!lightEntity) {
        return;
    }

    await SDK3DVerse.engineAPI.deleteEntities([lightEntity]);
    lightEntity = null;
}