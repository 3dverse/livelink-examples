window.addEventListener('load', initApp);

// The scene that is spawned when clicking "Link Scene"
const sceneToLinkUUID = 'LINK_SCENE_UUID';
let linkedSceneEntity = null;
let lightEntity = null;
let btnToggleScene;
let btnToggleLight;

async function initApp() {
    btnToggleScene = document.getElementById("btn-toggle-scene");
    btnToggleLight = document.getElementById("btn-toggle-light");
    btnToggleScene.innerText = "Spawn Scene";
    btnToggleLight.innerText = "Spawn Light";

    const isSessionCreator = await SDK3DVerse.joinOrStartSession({
        userToken: 'PUBLIC_TOKEN',
        sceneUUID: 'SCENE_UUID',
        canvas: document.getElementById('display-canvas'),
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.orbit,
        },
    });

    // Set camera settings to make the light entities more visible
    const cameraEntity = SDK3DVerse.engineAPI.cameraAPI.getActiveViewports()[0].getCamera();
    cameraEntity.setComponent('camera', {
        dataJSON: {
            // Disable reflection
            reflection: false,
            debugLines: true,
            skybox: false,
            atmosphere: false,
            gradient: true,
        }
    });

    // Set bottom gradient to black (top is white)
    SDK3DVerse.engineAPI.propagateSceneSettings({ environment: { ambientColorBottom: [0, 0, 0] } });

    // Spawn a light otherwise the cube is dark due to its 100% metalness.
    // But do it a single time for the whole session life time.
    if(isSessionCreator) {
        const pointLightComponentValue = {
            color: [1, 1, 1],
            intensity: 500,
            range: 0,
            isDirectional: false,
            isSun: false
        };
        const transform = {
            position: [3, 3, 3],
            orientation: SDK3DVerse.utils.quaternionFromEuler([-30, 45, 0])
        };
        const options = {
            deleteOnClientDisconnection: false,
            cutoff: 80
        };
        spawnLight(
            pointLightComponentValue,
            transform,
            options
        );
    }
}

const spawnSceneLinker = async function(sceneTransform, options = {}) {
    const {
        parentEntity = null,
        // delete entity if the client disconnects
        deleteOnClientDisconnection = true
    } = options;

    let template = new SDK3DVerse.EntityTemplate();
    template.attachComponent('scene_ref', { value: sceneToLinkUUID });
    template.attachComponent('local_transform', sceneTransform);
    const entity = await template.instantiateTransientEntity("linked scene name", parentEntity, deleteOnClientDisconnection);
    return entity;
}

window.toggleSceneLinker = async function() {
    if(linkedSceneEntity) {
        await SDK3DVerse.engineAPI.deleteEntities([linkedSceneEntity]).finally(() => {
            linkedSceneEntity = null;
            btnToggleScene.innerText = "Spawn Scene";
        });
    }
    else {
        linkedSceneEntity = await spawnSceneLinker({ position: [0, 0, -3] });
        btnToggleScene.innerText = "Delete Scene";
    }
}

const spawnLight = async function(pointLightComponentValue, pointLightTransform, options = {}) {
    const {
        parentEntity = null,
        // delete entity if the client disconnects
        deleteOnClientDisconnection = true,
        // the cut off of the spot light
        cutoff = 50
     } = options;

    let template = new SDK3DVerse.EntityTemplate();
    template.attachComponent('point_light', pointLightComponentValue);
    template.attachComponent('spot_light', { cutoff });
    template.attachComponent('local_transform', pointLightTransform);
    const entity = await template.instantiateTransientEntity("light name", parentEntity, deleteOnClientDisconnection);
    return entity;
}

window.toggleLight = async function() {
    if(lightEntity) {
        await SDK3DVerse.engineAPI.deleteEntities([lightEntity]).finally(() => {
            lightEntity = null;
            btnToggleLight.innerText = "Spawn Light";
        });
    }
    else {
        const pointLightComponentValue = {
            color: [1, 0, 0],
            intensity: 300,
            range: 0,
            isDirectional: false,
            isSun: false
        };
        const transform = {
            position: linkedSceneEntity ? [0, 2, 2] : [0, 2, 1],
            orientation: SDK3DVerse.utils.quaternionFromEuler([-45, 0, 0])
        };
        const options = {
            parentEntity: linkedSceneEntity
        };
        lightEntity = await spawnLight(
            pointLightComponentValue,
            transform,
            options
        );
        btnToggleLight.innerText = "Delete Light";
    }
}