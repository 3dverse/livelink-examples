# Overview
This is a minimal application sample.

# Run
It's a static frontend that can be served by any web server of your convenience. 
For example, globally install [serve](https://www.npmjs.com/package/serve):
```
npm install --global serve
```
Run the web server:
```
serve
```

Replace the following values into the [main.js](./main.js): 
- 'PUBLIC_TOKEN' by the public token of your application obtained from the [3dverse console](https://console.3dverse.com/) in the "API Access" section.
- 'SCENE_UUID' by the UUID of your scene obtained from the [3dverse console](https://console.3dverse.com/) in the "Asset browser" section.

Now open your web browser on http://localhost:3000 to enter the 3dverse session of your scene. 
