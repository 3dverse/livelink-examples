# Overview
An application sample to show a possible implementation to use the [Pointer Lock API](https://developer.mozilla.org/fr/docs/Web/API/Pointer_Lock_API)
with the [camera controller types](https://docs.3dverse.com/sdk/SDK3DVerse.html#cameraControllerType).

# Run
It's a static frontend that can be served by any web server of your convenience. 
For example, globally install [serve](https://www.npmjs.com/package/serve):
```
npm install --global serve
```
Then serve the current directory:
```
serve
```

Replace the following values into the [main.js](./main.js): 
- `PUBLIC_TOKEN` by the "Public Token" obtained from the [3dverse console in the "API Access" section](https://3dverse.com/docs/getting-started/setup-your-first-app/#d2f2797242f04420ab89476ea26ca944).
- `SCENE_UUID` by the "ASSET ID" of your public scene obtained from the [3dverse console in the "Asset browser" section](https://3dverse.com/docs/getting-started/setup-your-first-app/#d2f2797242f04420ab89476ea26ca944).

Now open your web browser on http://localhost:3000 to enter the 3dverse session of your scene. 
