import domBillboardRenderer from "./domBillboardRenderer";

window.addEventListener('load', initApp);

const { engineAPI } = SDK3DVerse;
let rootEntity = null;
const rootEntityName = 'SM_Cube';
const pbrOpqUntexShaderUUID = "744556b0-67b5-4329-ba4f-a04c04f92b1c";

async function initApp() {
    const isSessionCreator = await SDK3DVerse.joinOrStartSession({
        userToken: 'PUBLIC_TOKEN',
        sceneUUID: 'SCENE_UUID',
        canvas: document.getElementById('display-canvas'),
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.orbit,
        },
    });

    // Fetch the root entity by name and verify it has the expected components
    const entities = await engineAPI.findEntitiesByNames(rootEntityName);
    rootEntity = entities[0];
    if(!rootEntity) {
        console.error(`Could not find ${rootEntityName} entity`);
        return;
    }
    if(!rootEntity.isAttached('mesh_ref')) {
        console.error(`${rootEntityName} entity has no mesh component`);
        return;
    }
    if(!rootEntity.isAttached('material_ref')) {
        console.error(`${rootEntityName} entity has no material_ref component`);
        return;
    }

    // Prepare the entities needed to run the sample.
    // Make the cube something more like a plan.
    rootEntity.setGlobalTransform({ scale: [1, 1, 0.1] });

    // Spawn a light otherwise the cube is dark due to its 100% metalness.
    // But do it a single time for the whole session life time.
    if(isSessionCreator) {
        rootEntity.setComponent('local_transform', { scale: [1, 1, 0.1] });
        let triggerArea = new EntityTemplate();
        triggerArea.attachComponent('box_geometry');
        triggerArea.attachComponent('box_geometry');
    }

    domBillboardRenderer.addYoutubeVideoBillboard();
}

