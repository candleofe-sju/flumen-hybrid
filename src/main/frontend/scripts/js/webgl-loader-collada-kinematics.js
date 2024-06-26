import { css, html, LitElement } from "lit";

import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import TWEEN from 'three/addons/libs/tween.module.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';

export class WebglLoaderColladaKinematics extends LitElement {
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

        this.tweenParameters = {};
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        const loader = new ColladaLoader();
        loader.load('./models/collada/abb_irb52_7_120.dae', (collada) => {

            this.dae = collada.scene;

            this.dae.traverse((child) => {

                if (child.isMesh) {

                    // model does not have normals
                    child.material.flatShading = true;
                }
            });

            this.dae.scale.x = this.dae.scale.y = this.dae.scale.z = 10.0;
            this.dae.updateMatrix();

            this.kinematics = collada.kinematics;

            this.init();
            this.animate();
        });
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 2000);
        this.camera.position.set(2, 2, 3);

        this.scene = new THREE.Scene();

        // Grid
        const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
        this.scene.add(grid);

        // Add the COLLADA

        this.scene.add(this.dae);

        // Lights
        const light = new THREE.HemisphereLight(0xfff7f7, 0x494966, 3);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        this.setupTween();

        //
        window.addEventListener('resize', event => this.onWindowResize());

    }

    setupTween() {
        const duration = THREE.MathUtils.randInt(1000, 5000);

        const target = {};

        for (const prop in this.kinematics.joints) {
            if (this.kinematics.joints.hasOwnProperty(prop)) {
                if (!this.kinematics.joints[prop].static) {
                    const joint = this.kinematics.joints[prop];

                    const old = this.tweenParameters[prop];

                    const position = old ? old : joint.zeroPosition;

                    this.tweenParameters[prop] = position;

                    target[prop] = THREE.MathUtils.randInt(joint.limits.min, joint.limits.max);
                }
            }
        }

        this.kinematicsTween = new TWEEN.Tween(this.tweenParameters).to(target, duration).easing(TWEEN.Easing.Quadratic.Out);

        this.kinematicsTween.onUpdate((object) => {
            for (const prop in this.kinematics.joints) {
                if (this.kinematics.joints.hasOwnProperty(prop)) {
                    if (!this.kinematics.joints[prop].static) {
                        this.kinematics.setJointValue(prop, object[prop]);
                    }
                }
            }
        });

        this.kinematicsTween.start();

        setTimeout(this.setupTween, duration);
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.three_render();
        this.stats.update();
        TWEEN.update();
    }

    three_render() {
        const timer = Date.now() * 0.0001;

        this.camera.position.x = Math.cos(timer) * 20;
        this.camera.position.y = 10;
        this.camera.position.z = Math.sin(timer) * 20;

        this.camera.lookAt(0, 5, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-loader-collada-kinematics', WebglLoaderColladaKinematics);
