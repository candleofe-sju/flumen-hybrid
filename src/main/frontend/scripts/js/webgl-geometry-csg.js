import { css, html, LitElement } from "lit";
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg';

export class WebglGeometryCsg extends LitElement {
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
            operation: SUBTRACTION,
            useGroups: true,
            wireframe: false,
        };
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

        // environment
        this.camera = new THREE.PerspectiveCamera(50, this.containerWidth / this.containerHeight, 1, 100);
        this.camera.position.set(-1, 1, 1).normalize().multiplyScalar(10);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfce4ec);

        // lights
        const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 3);
        this.scene.add(ambient);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(1, 4, 3).multiplyScalar(3);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.setScalar(2048);
        directionalLight.shadow.bias = -1e-4;
        directionalLight.shadow.normalBias = 1e-4;
        this.scene.add(directionalLight);

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // add shadow plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(),
            new THREE.ShadowMaterial({
                color: 0xd81b60,
                transparent: true,
                opacity: 0.075,
                side: THREE.DoubleSide,
            }),
        );
        plane.position.y = -3;
        plane.rotation.x = -Math.PI / 2;
        plane.scale.setScalar(10);
        plane.receiveShadow = true;
        this.scene.add(plane);

        // create brushes
        this.evaluator = new Evaluator();

        this.baseBrush = new Brush(
            new THREE.IcosahedronGeometry(2, 3),
            new THREE.MeshStandardMaterial({
                flatShading: true,
                polygonOffset: true,
                polygonOffsetUnits: 1,
                polygonOffsetFactor: 1,
            }),
        );

        this.brush = new Brush(
            new THREE.CylinderGeometry(1, 1, 5, 45),
            new THREE.MeshStandardMaterial({
                color: 0x80cbc4,
                polygonOffset: true,
                polygonOffsetUnits: 1,
                polygonOffsetFactor: 1,
            }),
        );

        this.core = new Brush(
            new THREE.IcosahedronGeometry(0.15, 1),
            new THREE.MeshStandardMaterial({
                flatShading: true,
                color: 0xff9800,
                emissive: 0xff9800,
                emissiveIntensity: 0.35,
                polygonOffset: true,
                polygonOffsetUnits: 1,
                polygonOffsetFactor: 1,
            }),
        );
        this.core.castShadow = true;
        this.scene.add(this.core);

        // create wireframe
        this.wireframe = new THREE.Mesh(
            undefined,
            new THREE.MeshBasicMaterial({ color: 0x009688, wireframe: true }),
        );
        this.scene.add(this.wireframe);

        // controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 5;
        controls.maxDistance = 75;

        // set up gui
        const gui = new GUI();
        gui.add(this.params, 'operation', { SUBTRACTION, INTERSECTION, ADDITION });
        gui.add(this.params, 'wireframe');
        gui.add(this.params, 'useGroups');

        this.onWindowResize();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', event => this.onWindowResize());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onWindowResize, true);
        super.disconnectedCallback();
    }

    updateCSG() {
        this.evaluator.useGroups = this.params.useGroups;
        this.result = this.evaluator.evaluate(this.baseBrush, this.brush, this.params.operation, this.result);

        this.result.castShadow = true;
        this.result.receiveShadow = true;
        this.scene.add(this.result);
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // update the transforms
        const t = window.performance.now() + 9000;
        this.baseBrush.rotation.x = t * 0.0001;
        this.baseBrush.rotation.y = t * 0.00025;
        this.baseBrush.rotation.z = t * 0.0005;
        this.baseBrush.updateMatrixWorld();

        this.brush.rotation.x = t * -0.0002;
        this.brush.rotation.y = t * -0.0005;
        this.brush.rotation.z = t * -0.001;

        const s = 0.5 + 0.5 * (1 + Math.sin(t * 0.001));
        this.brush.scale.set(s, 1, s);
        this.brush.updateMatrixWorld();

        // update the csg
        this.updateCSG();

        this.wireframe.geometry = this.result.geometry;
        this.wireframe.visible = this.params.wireframe;

        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }
}

customElements.define('webgl-geometry-csg', WebglGeometryCsg);