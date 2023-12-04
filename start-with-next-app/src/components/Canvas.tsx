'use client';

import Script from 'next/script';

export const Canvas = () => {
  const initApp = async () => {
    await SDK3DVerse.joinOrStartSession({
      userToken: 'PUBLIC_TOKEN',
      sceneUUID: 'SCENE_UUID',
      canvas: document.getElementById('display-canvas'),
      viewportProperties: {
        defaultControllerType: SDK3DVerse.controller_type.orbit,
      },
    });
  };
  return (
    <>
      <Script
        src='https://cdn.3dverse.com/legacy/sdk/latest/SDK3DVerse.js'
        onLoad={initApp}
      />
      <canvas
        id='display-canvas'
        className='w-screen h-screen'
        tabIndex="1"
      >
      </canvas>
    </>
  );
};
