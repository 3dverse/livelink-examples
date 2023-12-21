//--------------------------------------------------------------------------
import { importCssRenderer } from './CSS3DRenderer.js';

//--------------------------------------------------------------------------
const SDK3DVerse = window.SDK3DVerse;
const SDK3DVerse_ThreeJS_Ext = window.SDK3DVerse_ThreeJS_Ext;

//--------------------------------------------------------------------------
class DomBillboardRenderer
{
    //----------------------------------------------------------------------
    constructor() {
        this.sdk = SDK3DVerse;
        this.engineAPI = SDK3DVerse.engineAPI;
        this.cameraAPI = SDK3DVerse.engineAPI.cameraAPI;

        this.billboards = [];

        this.triggererEntity = null;

        this.CSS3DObject = null;
        this.THREE = null;
        this.scene = null;
        this.renderer = null;
    }

    //--------------------------------------------------------------------------
    async init() {
        await this.sdk.installExtension(SDK3DVerse_ThreeJS_Ext);

        const canvas = this.engineAPI.canvas;
        const container = canvas.parentNode;

        const { CSS3DObject, CSS3DRenderer } = importCssRenderer(this.sdk.threeJS.THREE);
        this.CSS3DObject = CSS3DObject;
        this.THREE = this.sdk.threeJS.THREE;
        this.scene = new this.THREE.Scene();
        this.renderer = new CSS3DRenderer();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        // Define stylesheet of the renderer's div
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.pointerEvents = 'none';
        container.appendChild(this.renderer.domElement);

        return true;
    }

    //--------------------------------------------------------------------------
    async enable(triggererEntity) {
        this.disable();

        // If triggerEntity is a camera then instanciate a transient entity as child of the camera
        // with a geometry and a physics_material, so camera entity could trigger the trigger
        this.triggererEntity = triggererEntity;
        this.engineAPI.onEnterTrigger(this.onTriggerEntered);
        this.engineAPI.onExitTrigger(this.onTriggerExited);

        this.sdk.notifier.on('onFramePostRender', this.onFramePostRender);
        this.sdk.notifier.on('onCanvasResized', this.onCanvasResized);
    }

    //--------------------------------------------------------------------------
    disable() {
        this.sdk.notifier.off('onFramePostRender', this.onFramePostRender);
        this.sdk.notifier.off('onCanvasResized', this.onCanvasResized);

        for (const billboard of this.billboards) {
            billboard.setVisibility(false);
        }

        if(this.trigerrerEntity) {
            SDK3DVerse.engineAPI.setEntityVisibility(this.trigerrerEntity, true);
        }
    }

    //--------------------------------------------------------------------------
    onCanvasResized = (width, height) => {
        this.renderer.setSize(width, height);
    }

    //--------------------------------------------------------------------------
    onFramePostRender = () => {
        const viewports = this.cameraAPI.getActiveViewports();
        for (const viewport of viewports) {
            const camera = viewport.threeJScamera;
            if (camera) {
                this.renderer.render(this.scene, camera);
            }
        }
    }

    //--------------------------------------------------------------------------
    getTriggeredBillboard(triggerer, trigger) {
        if(this.triggererEntity !== triggerer) {
            return;
        }

        return this.billboards.find(b => b.triggerEntity === trigger);
    }

    //--------------------------------------------------------------------------
    onTriggerEntered = (triggerer, trigger) => {
        console.debug("onTriggerEntered", triggerer, trigger);
        const billboard = this.getTriggeredBillboard(triggerer, trigger);
        if(billboard) {
            billboard.setVisibility(true);
        }
    }

    //--------------------------------------------------------------------------
    onTriggerExited = (triggerer, trigger) => {
        console.debug("onTriggerExited", triggerer, trigger);
        const billboard = this.getTriggeredBillboard(triggerer, trigger);
        if(billboard) {
            billboard.setVisibility(false);
        }
    }

    //--------------------------------------------------------------------------
    async addYoutubeVideoBillboard(youtubeVideoURI, placeholderEntity, triggerEntity) {
        const iframeURL = [ 'https://www.youtube.com/embed/', youtubeVideoURI, '?rel=0', '&autoplay=1' ].join('');
        // Create a video element, with the plane entity global transform.
        const billboard = this.createVideoBillboard(iframeURL, placeholderEntity.getGlobalTransform());
        billboard.triggerEntity = triggerEntity;

        this.billboards.push(billboard);
        this.scene.add(billboard);
    }

    //--------------------------------------------------------------------------
    createVideoBillboard(iframeURL, globalTransform) {
        // The plane where the video is rendered is actually sized by
        // 2 units of width and height (2 squares in the debug lines) in its local space.
        const planeWidth = 2;
        const planeHeight = 2;

        // In the scene, the plane entity is scaled with [16.0, 9.0, 1] in its
        // local_transform components to reproduce standard aspect ratio.
        const planeScale = globalTransform.scale;

        // 1px in css3dRenderer is 1 unit in the 3dverse space (i.e. 1 square in the debug lines)
        // Since 1 pixel for 1 unit would make a giant plane in the scene, we will scale it.
        const pixelToUnitScale = 400; // 100 pixel = 1 unit

        // We're going to apply the scale of the plane entity, on the dom's element width and height.
        const div = document.createElement('div');
        div.style.width = (planeScale[0] * pixelToUnitScale) + 'px';
        div.style.height = (planeScale[1] * pixelToUnitScale) + 'px';
        div.classList.add('video-element');

        const iframe = document.createElement('iframe');
        iframe.style.width = (planeScale[0] * pixelToUnitScale) + 'px';
        iframe.style.height = (planeScale[1] * pixelToUnitScale) + 'px';
        iframe.style.border = '0px';
        div.appendChild(iframe);

        const object = new this.CSS3DObject(div);
        object.position.fromArray(globalTransform.position);
        object.quaternion.fromArray(globalTransform.orientation);

        // The following statement will divide the scale by 50 to fit the plane,
        // since our unit scale is 100 and the plane is 2 unit of width and height
        object.scale.fromArray( [
            1 / (pixelToUnitScale / planeWidth),    // X
            1 / (pixelToUnitScale / planeHeight),   // Y
            1                                       // Z
        ]);
        object.updateMatrixWorld();

        object.isVisible = () => {
            return div.classList.contains('visible');
        };

        object.setVisibility = (isVisible) => {
            if (isVisible) {
                div.classList.add('visible');
                iframe.src = iframeURL;
            }
            else {
                div.classList.remove('visible');
                iframe.src = '';
            }
        };

        return object;
    };
}

//--------------------------------------------------------------------------
export default new DomBillboardRenderer();