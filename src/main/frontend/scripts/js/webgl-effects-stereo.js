import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { StereoEffect } from 'three/addons/effects/StereoEffect.js';

export class WebglEffectsStereo extends LitElement {
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
        this.spheres = [];

        this.mouseX = 0;
        this.mouseY = 0;

        document.addEventListener('mousemove', event => this.onDocumentMouseMove(event));
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

        this.camera = new THREE.PerspectiveCamera(60, this.containerWidth / this.containerHeight, 1, 100000);
        this.camera.position.z = 3200;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath('textures/cube/Park3Med/')
            .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

        const geometry = new THREE.SphereGeometry(100, 32, 16);

        const textureCube = new THREE.CubeTextureLoader()
            .setPath('textures/cube/Park3Med/')
            .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
        textureCube.mapping = THREE.CubeRefractionMapping;

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 });

        for (let i = 0; i < 500; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = Math.random() * 10000 - 5000;
            mesh.position.y = Math.random() * 10000 - 5000;
            mesh.position.z = Math.random() * 10000 - 5000;
            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
            this.scene.add(mesh);

            this.spheres.push(mesh);
        }

        //
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.windowHalfX = this.containerWidth / 2;
        this.windowHalfY = this.containerHeight / 2;

        this.effect = new StereoEffect(this.renderer);
        this.effect.setSize(this.containerWidth, this.containerHeight);

        //
        window.addEventListener('resize', event => this.onWindowResize());
    }

    onWindowResize() {
        this.windowHalfX = this.containerWidth / 2;
        this.windowHalfY = this.containerHeight / 2;

        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.effect.setSize(this.containerWidth, this.containerHeight);

    }

    onDocumentMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX) * 10;
        this.mouseY = (event.clientY - this.windowHalfY) * 10;
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.three_render();
    }

    three_render() {

        const timer = 0.0001 * Date.now();

        this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * .05;
        this.camera.lookAt(this.scene.position);

        for (let i = 0, il = this.spheres.length; i < il; i++) {
            const sphere = this.spheres[i];

            sphere.position.x = 5000 * Math.cos(timer + i);
            sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
        }

        this.effect.render(this.scene, this.camera);
    }
}

customElements.define('webgl-effects-stereo', WebglEffectsStereo);


