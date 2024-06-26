import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class WebglClippingIntersection extends LitElement {
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

        this.params = {
            clipIntersection: true,
            planeConstant: 0,
            showHelpers: false,
            alphaToCoverage: true,
        };

        this.clipPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
        ];
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

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.localClippingEnabled = true;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, this.containerWidth / this.containerHeight, 1, 200);

        this.camera.position.set(-1.5, 2.5, 3.0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', this.three_render.bind(this)); // use only if there is no animation loop
        controls.minDistance = 1;
        controls.maxDistance = 10;
        controls.enablePan = false;

        const light = new THREE.HemisphereLight(0xffffff, 0x080808, 4.5);
        light.position.set(-1.25, 1, 1.25);
        this.scene.add(light);

        //
        const group = new THREE.Group();

        for (let i = 1; i <= 30; i += 2) {
            const geometry = new THREE.SphereGeometry(i / 30, 48, 24);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5, THREE.SRGBColorSpace),
                side: THREE.DoubleSide,
                clippingPlanes: this.clipPlanes,
                clipIntersection: this.params.clipIntersection,
                alphaToCoverage: true,
            });

            group.add(new THREE.Mesh(geometry, material));
        }

        this.scene.add(group);

        // helpers
        const helpers = new THREE.Group();
        helpers.add(new THREE.PlaneHelper(this.clipPlanes[0], 2, 0xff0000));
        helpers.add(new THREE.PlaneHelper(this.clipPlanes[1], 2, 0x00ff00));
        helpers.add(new THREE.PlaneHelper(this.clipPlanes[2], 2, 0x0000ff));
        helpers.visible = false;
        this.scene.add(helpers);

        // gui
        const gui = new GUI();

        gui.add(this.params, 'alphaToCoverage').onChange(value => {
            group.children.forEach(c => {
                c.material.alphaToCoverage = Boolean(value);
                c.material.needsUpdate = true;
            });

            this.three_render();
        });

        gui.add(this.params, 'clipIntersection').name('clip intersection').onChange(value => {
            const children = group.children;

            for (let i = 0; i < children.length; i++) {
                children[i].material.clipIntersection = value;
            }

            this.three_render();
        });

        gui.add(this.params, 'planeConstant', -1, 1).step(0.01).name('plane constant').onChange(value => {
            for (let j = 0; j < this.clipPlanes.length; j++) {
                this.clipPlanes[j].constant = value;
            }

            this.three_render();
        });

        gui.add(this.params, 'showHelpers').name('show helpers').onChange(value => {
            helpers.visible = value;
            this.three_render();
        });

        //
        window.addEventListener('resize', this.onWindowResize.bind(this));
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

customElements.define('webgl-clipping-intersection', WebglClippingIntersection);