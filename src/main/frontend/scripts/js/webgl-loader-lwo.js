import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LWOLoader } from 'three/addons/loaders/LWOLoader.js';

export class WebglLoaderLwo extends LitElement {
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

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 200);
        this.camera.position.set(-0.7, 14.6, 43.2);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);

        const ambientLight = new THREE.AmbientLight(0xbbbbbb);
        this.scene.add(ambientLight);

        const light1 = new THREE.DirectionalLight(0xc1c1c1, 3);
        light1.position.set(0, 200, 100);
        this.scene.add(light1);

        const grid = new THREE.GridHelper(200, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.3;
        grid.material.transparent = true;
        this.scene.add(grid);

        const loader = new LWOLoader();
        loader.load('models/lwo/Objects/LWO3/Demo.lwo', (object) => {
            const phong = object.meshes[0];
            phong.position.set(-2, 12, 0);

            const standard = object.meshes[1];
            standard.position.set(2, 12, 0);

            const rocket = object.meshes[2];
            rocket.position.set(0, 10.5, -1);

            this.scene.add(phong, standard, rocket);
        });

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.setAnimationLoop(this.animation.bind(this));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(1.33, 10, -6.7);
        controls.update();

        window.addEventListener('resize', event => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    animation() {
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-loader-lwo', WebglLoaderLwo);
