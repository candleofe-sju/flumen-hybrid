import { css, html, LitElement } from "lit";
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

export class WebglLensflares extends LitElement {
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

        this.stats = null;

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.controls = null;

        this.clock = new THREE.Clock();
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

        // camera
        this.camera = new THREE.PerspectiveCamera(40, this.containerWidth / this.containerHeight, 1, 15000);
        this.camera.position.z = 250;

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color().setHSL(0.51, 0.4, 0.01, THREE.SRGBColorSpace);
        this.scene.fog = new THREE.Fog(this.scene.background, 3500, 15000);

        // world
        const s = 250;

        const geometry = new THREE.BoxGeometry(s, s, s);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 50 });

        for (let i = 0; i < 3000; i++) {
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
            mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
            mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;

            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            this.scene.add(mesh);
        }

        // lights
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.15);
        dirLight.position.set(0, -1, 0).normalize();
        dirLight.color.setHSL(0.1, 0.7, 0.5);
        this.scene.add(dirLight);

        // lensflares
        const textureLoader = new THREE.TextureLoader();

        this.textureFlare0 = textureLoader.load('textures/lensflare/lensflare0.png');
        this.textureFlare3 = textureLoader.load('textures/lensflare/lensflare3.png');

        this.addLight(0.55, 0.9, 0.5, 5000, 0, -1000);
        this.addLight(0.08, 0.8, 0.5, 0, 0, -1000);
        this.addLight(0.995, 0.5, 0.9, 5000, 5000, -1000);

        // renderer
        let canvas = this.renderRoot.querySelector('#container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        //
        this.controls = new FlyControls(this.camera, this.renderer.domElement);

        this.controls.movementSpeed = 2500;
        this.controls.domElement = canvas;
        this.controls.rollSpeed = Math.PI / 6;
        this.controls.autoForward = false;
        this.controls.dragToLook = false;

        // stats
        this.stats = new Stats();
        canvas.appendChild(this.stats.dom);

        // events
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addLight(h, s, l, x, y, z)
    {
        const light = new THREE.PointLight(0xffffff, 1.5, 2000, 0);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        this.scene.add(light);

        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(this.textureFlare0, 700, 0, light.color));
        lensflare.addElement(new LensflareElement(this.textureFlare3, 60, 0.6));
        lensflare.addElement(new LensflareElement(this.textureFlare3, 70, 0.7));
        lensflare.addElement(new LensflareElement(this.textureFlare3, 120, 0.9));
        lensflare.addElement(new LensflareElement(this.textureFlare3, 70, 1));
        light.add(lensflare);
    }

    //
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
    }

    three_render() {
        const delta = this.clock.getDelta();

        this.controls.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-lensflares', WebglLensflares);