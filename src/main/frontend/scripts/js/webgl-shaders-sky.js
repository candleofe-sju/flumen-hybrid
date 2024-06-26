import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

export class WebglShadersSky extends LitElement {
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
        this.three_render();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    initSky() {
        // Add Sky
        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        this.scene.add(this.sky);

        this.sun = new THREE.Vector3();

        /// GUI
        this.effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,
            azimuth: 180,
            exposure: this.renderer.toneMappingExposure
        };
    }

    guiChanged() {
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = this.effectController.turbidity;
        uniforms['rayleigh'].value = this.effectController.rayleigh;
        uniforms['mieCoefficient'].value = this.effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = this.effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - this.effectController.elevation);
        const theta = THREE.MathUtils.degToRad(this.effectController.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(this.sun);

        this.renderer.toneMappingExposure = this.effectController.exposure;
        this.renderer.render(this.scene, this.camera);
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(60, this.containerWidth / this.containerHeight, 100, 2000000);
        this.camera.position.set(0, 100, 2000);

        this.scene = new THREE.Scene();

        const helper = new THREE.GridHelper(10000, 2, 0xffffff, 0xffffff);
        this.scene.add(helper);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', event => this.three_render.bind(this));
        //controls.maxPolarAngle = Math.PI / 2;
        controls.enableZoom = false;
        controls.enablePan = false;

        this.initSky();

        window.addEventListener('resize', event => this.onWindowResize());

        const gui = new GUI();

        gui.add(this.effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'rayleigh', 0.0, 4, 0.001).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'elevation', 0, 90, 0.1).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'azimuth', -180, 180, 0.1).onChange(value => this.guiChanged());
        gui.add(this.effectController, 'exposure', 0, 1, 0.0001).onChange(value => this.guiChanged());

        this.guiChanged();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.three_render();
    }

    three_render() {
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-shaders-sky', WebglShadersSky);