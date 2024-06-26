import { css, html, LitElement } from "lit";
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

export class WebglMaterialsCubemapRefraction extends LitElement {
    static styles = css`
        #container {
            width: 100%;
            height: 100%;
            background-color: azure;
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

        this.windowHalfX = this.containerWidth / 2;
        this.windowHalfY = this.containerHeight / 2;

        this.camera = new THREE.PerspectiveCamera(50, this.containerWidth / this.containerHeight, 1, 100000);
        this.camera.position.z = -4000;

        //
        const r = 'textures/cube/Park3Med/';

        const urls = [
            r + 'px.jpg', r + 'nx.jpg',
            r + 'py.jpg', r + 'ny.jpg',
            r + 'pz.jpg', r + 'nz.jpg'
        ];

        const textureCube = new THREE.CubeTextureLoader().load(urls);
        textureCube.mapping = THREE.CubeRefractionMapping;

        this.scene = new THREE.Scene();
        this.scene.background = textureCube;

        // LIGHTS
        const ambient = new THREE.AmbientLight(0xffffff, 3.5);
        this.scene.add(ambient);

        // material samples
        const cubeMaterial3 = new THREE.MeshPhongMaterial({
            color: 0xccddff,
            envMap: textureCube,
            refractionRatio: 0.98,
            reflectivity: 0.9
        });
        const cubeMaterial2 = new THREE.MeshPhongMaterial({
            color: 0xccfffd,
            envMap: textureCube,
            refractionRatio: 0.985
        });
        const cubeMaterial1 = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            envMap: textureCube,
            refractionRatio: 0.98
        });

        //
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        const loader = new PLYLoader();
        loader.load('models/ply/binary/Lucy100k.ply', (geometry) => {
            this.createScene(geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3);
        });

        document.addEventListener('mousemove', event => this.onDocumentMouseMove(event));

        //
        window.addEventListener('resize', event => this.onWindowResize());
    }

    onWindowResize() {
        this.windowHalfX = this.containerWidth / 2;
        this.windowHalfY = this.containerHeight / 2;

        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    createScene(geometry, m1, m2, m3) {
        geometry.computeVertexNormals();

        const s = 1.5;

        let mesh = new THREE.Mesh(geometry, m1);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(geometry, m2);
        mesh.position.x = -1500;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(geometry, m3);
        mesh.position.x = 1500;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        this.scene.add(mesh);
    }

    onDocumentMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX) * 4;
        this.mouseY = (event.clientY - this.windowHalfY) * 4;
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.three_render();
        this.stats.update();
    }

    three_render() {
        this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * .05;

        this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-materials-cubemap-refraction', WebglMaterialsCubemapRefraction);