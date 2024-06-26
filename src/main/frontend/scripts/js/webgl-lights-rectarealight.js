import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

export class WebglLightsRectarealight extends LitElement {
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
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        this.diff = 0;

        this.init();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.setAnimationLoop(this.animation.bind(this));

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 1000);
        this.camera.position.set(0, 5, -15);

        this.scene = new THREE.Scene();

        RectAreaLightUniformsLib.init();

        const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 4, 10);
        rectLight1.position.set(-5, 5, 5);
        this.scene.add(rectLight1);

        const rectLight2 = new THREE.RectAreaLight(0x00ff00, 5, 4, 10);
        rectLight2.position.set(0, 5, 5);
        this.scene.add(rectLight2);

        const rectLight3 = new THREE.RectAreaLight(0x0000ff, 5, 4, 10);
        rectLight3.position.set(5, 5, 5);
        this.scene.add(rectLight3);

        this.scene.add(new RectAreaLightHelper(rectLight1));
        this.scene.add(new RectAreaLightHelper(rectLight2));
        this.scene.add(new RectAreaLightHelper(rectLight3));

        const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
        const matStdFloor = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0 });
        const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
        this.scene.add(mshStdFloor);

        const geoKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 16);
        const matKnot = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0 });
        this.meshKnot = new THREE.Mesh(geoKnot, matKnot);
        this.meshKnot.position.set(0, 5, 0);
        this.scene.add(this.meshKnot);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.copy(this.meshKnot.position);
        controls.update();

        //
        window.addEventListener('resize', event => this.onWindowResize());

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    onWindowResize() {
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.camera.aspect = (this.containerWidth / this.containerHeight);
        this.camera.updateProjectionMatrix();
    }

    animation(time) {
        this.meshKnot.rotation.y = time / 1000;
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }
}

customElements.define('webgl-lights-rectarealight', WebglLightsRectarealight);