import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class WebglLoaderGltfLights extends LitElement {
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
        this.params = {
            punctualLightsEnabled: true
        };

        this.init();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    async init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 0.25, 20);
        this.camera.position.set(-2, 1.5, 3);

        this.scene = new THREE.Scene();

        const rgbeLoader = new RGBELoader();
        const envMap = await rgbeLoader.loadAsync('textures/equirectangular/moonless_golf_1k.hdr ');
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.scene.background = envMap;
        this.scene.environment = envMap;

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('models/gltf/LightsPunctualLamp.glb');

        this.scene.add(gltf.scene);

        const gui = new GUI();

        gui.add(this.params, 'punctualLightsEnabled').onChange(value => {
            this.scene.traverse((object) => {
                if (object.isLight) {
                    object.visible = value;
                }
            });

            this.three_render();
        });

        gui.open();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', event => this.three_render()); // use if there is no animation loop
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.target.set(0, 1, 0);
        controls.update();

        window.addEventListener('resize', event => this.onWindowResize());

        this.three_render();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth / this.containerHeight);

        this.three_render();
    }

    //
    three_render() {
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-loader-gltf-lights', WebglLoaderGltfLights);
