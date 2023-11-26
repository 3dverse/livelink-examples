window.addEventListener('load', initApp);

async function initApp() {
  await SDK3DVerse.joinOrStartSession({
    userToken: 'PUBLIC_TOKEN',
    sceneUUID: 'SCENE_UUID',
    canvas: document.getElementById('display-canvas'),
    viewportProperties: {
      defaultControllerType: SDK3DVerse.controller_type.orbit,
    },
  });
}
