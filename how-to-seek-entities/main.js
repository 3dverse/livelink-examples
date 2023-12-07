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

    // Setup the entities needed to run the sample.
    // But do it a single time for the whole session life time.
    if(isSessionCreator) {
        // Remove material reference component from rootEntity if there's one
        rootEntity.detachComponent('material_ref');
        // Attach red material component to rootEntity
        rootEntity.attachComponent('material', {
            shaderRef: pbrOpqUntexShaderUUID,
            isDoubleSided: false,
            dataJSON: { albedo: [1, 0, 0], metallic: 0.1, roughnees: 0.8 }
        });
        rootEntity.setGlobalTransform({ position: [0, -0.5, 0] });

        // Clone rootEntity with blue and green material at different positions and as children of rootEntity
        const childA = await duplicateEntity(rootEntity, { name: "ChildA", parentEntity: rootEntity, transform: { position: [1, 1, 0] } });
        childA.setComponent('material', { dataJSON: { albedo: [0, 1, 0] } })
        const childB = await duplicateEntity(rootEntity, { name: "ChildB", parentEntity: rootEntity, transform: { position: [-1, 1, 0] } });
        childB.setComponent('material', { dataJSON: { albedo: [0, 0, 1] } })
    }

    // Demonstrate the various ways to seek entities
    seekEntities();
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


async function seekEntities() {
    const { engineAPI } = SDK3DVerse;
    const rootEntities = await engineAPI.getRootEntities();
    console.log("Scene graph root entities:", rootEntities);
    const envEntity = rootEntities.find(e => e.getName() === 'Env');
    console.log("Environment (skybox) entity:", rootEntities);
    const entities = await engineAPI.findEntitiesByNames(rootEntityName);
    const rootEntity = entities[0];
    console.log(`The entity named ${rootEntityName}:`, rootEntity);
    const children = await rootEntity.getChildren();
    console.log(`The children of ${rootEntityName} entity:`, children);
    const parent = children[0].getParent();
    console.log(`The parent of the first children of ${rootEntityName} entity:`, parent);

    // Beware the changes performed on rootEntity and its duplicated children were not saved
    // through Entity.save() method. So forth the rootEntity is returned by the following call
    // to findEntitiesByComponents because it originally has a material_ref that was changed for a material component.
    let componentFilter = { mandatoryComponents: [], forbiddenComponents : ['material'] };
    const entitiesWithMaterial = await engineAPI.findEntitiesByComponents(componentFilter);
    console.log(`Entities without a material component:`, entitiesWithMaterial);

    // For the same reason as previous the comment, the children of rootEntity, returned by
    // the following call to findEntitiesByComponents, show a red albedo value in their material component.
    componentFilter = { mandatoryComponents: ['material'], forbiddenComponents : [] };
    const entitiesWithoutMaterial = await engineAPI.findEntitiesByComponents(componentFilter);
    console.log(`Entities with a material component:`, entitiesWithoutMaterial);
}