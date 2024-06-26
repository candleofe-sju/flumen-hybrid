import { css, html, LitElement } from "lit";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { USDZLoader } from 'three/addons/loaders/USDZLoader.js';

export class WebglLoaderUsdz extends LitElement {
    static styles = css`
        #container {
            width: 100%;
            height: 100%;
        }
    `;

    get containerWidth() {
        return window.innerWidth - this.diff;
    }

    get containerHeight() {
        return window.innerHeight - this.diff;
    }

    constructor() {
        super();

        this.diff = 0;
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        this.init();
        this.animate();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    async init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(60, this.containerWidth / this.containerHeight, 0.1, 100);
        this.camera.position.set(0, 0.75, -1.5);

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 2.0;

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 1;
        controls.maxDistance = 8;
        // controls.target.y = 15;
        // controls.update();

        const rgbeLoader = new RGBELoader()
            .setPath('textures/equirectangular/');

        const usdzLoader = new USDZLoader()
            .setPath('models/usdz/');

        const [texture, model] = await Promise.all([
            rgbeLoader.loadAsync('venice_sunset_1k.hdr'),
            usdzLoader.loadAsync('saeukkang.usdz'),
        ]);

        // environment
        texture.mapping = THREE.EquirectangularReflectionMapping;

        this.scene.background = texture;
        this.scene.backgroundBlurriness = 0.5;
        this.scene.environment = texture;

        // model
        model.position.y = 0.25;
        model.position.z = -0.25;
        this.scene.add(model);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', event => this.onWindowResize());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onWindowResize, true);
        super.disconnectedCallback();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-loader-usdz', WebglLoaderUsdz);