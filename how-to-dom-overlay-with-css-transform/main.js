import domBillboardRenderer from "./domBillboardRenderer.js";

window.addEventListener('load', initApp);

const { engineAPI } = SDK3DVerse;
let rootEntity = null;
const rootEntityName = 'SM_Cube';

async function initApp() {
    const isSessionCreator = await SDK3DVerse.startSession({
        userToken: 'public_ZZCEe82kIwqBeVCd',
        sceneUUID: '5f275e69-c617-4a13-a1a9-a93142596d5e',
        canvas: document.getElementById('display-canvas'),
        viewportProperties: {
            defaultControllerType: SDK3DVerse.controller_type.editor,
        },
        isTransient: true,
        startSimulation: 'assets-loaded'
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
    // Make the cube something more like a screen plan.
    rootEntity.setComponent('local_transform', { scale: [1, 1, 0.1] });
    rootEntity.save();
    let triggerArea = new SDK3DVerse.EntityTemplate();
    triggerArea.attachComponent('box_geometry', { dimension: [1, 1, 1]});
    triggerArea.attachComponent('physics_material', { isTrigger: true });
    let triggerAreaEntity = await triggerArea.instantiateTransientEntity('TriggerArea');

    await domBillboardRenderer.init();
    await domBillboardRenderer.addYoutubeVideoBillboard('ZK_HGO_l_UM', rootEntity, triggerAreaEntity);

    const camera = engineAPI.cameraAPI.getViewports()[0].getCamera();
    const camTrigger = await duplicateEntity(rootEntity, { name: "camTrigger", parentEntity: camera, transform: { position: [0, 0, 0], scale: [0.1, 0.1, 0.1] } });
    camTrigger.detachComponent('material_ref');
    camTrigger.attachComponent('material', { dataJSON: { albedo: [0, 1, 0], metallic: 0.1, roughnees: 0.8 } });
    camTrigger.attachComponent('physics_material');
    camTrigger.attachComponent('box_geometry');
    camTrigger.attachComponent('rigid_body', { isKinematic: true });
    camTrigger.save();
    camTrigger.setVisibility(true);
    await domBillboardRenderer.enable(camTrigger);
}

const duplicateEntity = async function(entitySource, options = {}) {
    const {
        parentEntity = null,
        // delete entity if the client disconnects
        deleteOnClientDisconnection = false,
        name = `${entity.getName()} copy`,
        transform = null
    } = options;

    // Duplicate entitySource by ignoring some of its components: system components and debug_name
    let template = new SDK3DVerse.EntityTemplate();
    const components = entitySource.getComponents();
    const componentsToIgnore = ['debug_name', 'euid', 'lineage', 'initial_local_aabb', 'local_aabb'];
    for(const componentName of Object.keys(components)) {
        if(componentsToIgnore.includes(componentName)) {
            continue;
        }
        template.attachComponent(componentName, components[componentName]);
    }

    if(transform) {
        template.attachComponent('local_transform', transform);
    }

    // Spawn the duplicate of entitySource
    const entity = await template.instantiateTransientEntity(name, parentEntity, deleteOnClientDisconnection);
    return entity;
}