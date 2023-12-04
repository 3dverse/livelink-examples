import { useCallback, useEffect } from 'react';
import { useScript } from '@uidotdev/usehooks';

export const Canvas = () => {
  const status = useScript(
    `https://cdn.3dverse.com/legacy/sdk/latest/SDK3DVerse.js`,
    {
      removeOnUnmount: false,
    }
  );

  const initApp = useCallback(async () => {
    await SDK3DVerse.joinOrStartSession({
      userToken: 'PUBLIC_TOKEN',
      sceneUUID: 'SCENE_UUID',
      canvas: document.getElementById('display-canvas'),
      viewportProperties: {
        defaultControllerType: SDK3DVerse.controller_type.orbit,
      },
    });
  }, []);

  useEffect(() => {
    if (status === 'ready') {
      initApp();
    }
  }, [status]);

  return (
    <>
      <canvas
        id='display-canvas'
        style={{
          height: '100vh',
          width: '100vw',
          verticalAlign: 'middle',
        }}
        tabIndex="1"
      ></canvas>
    </>
  );
};
