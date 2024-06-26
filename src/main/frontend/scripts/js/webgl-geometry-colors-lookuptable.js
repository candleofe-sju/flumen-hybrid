import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Lut } from 'three/addons/math/Lut.js';

export class WebglGeometryColorsLookuptable extends LitElement {
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
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffc800);

        this.uiScene = new THREE.Scene();

        this.lut = new Lut();

        const width = this.containerWidth;
        const height = this.containerHeight;

        this.perpCamera = new THREE.PerspectiveCamera(60, width / height, 1, 100);
        this.perpCamera.position.set(0, 0, 10);
        this.scene.add(this.perpCamera);

        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2);
        this.orthoCamera.position.set(0.5, 0, 1);

        this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(this.lut.createCanvas())
        }));
        this.sprite.material.map.colorSpace = THREE.SRGBColorSpace;
        this.sprite.scale.x = 0.125;
        this.uiScene.add(this.sprite);

        this.mesh = new THREE.Mesh(undefined, new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: 0xF5F5F5,
            vertexColors: true
        }));
        this.scene.add(this.mesh);

        this.params = {
            colorMap: 'rainbow',
        };

        this.loadModel();

        const pointLight = new THREE.PointLight(0xffffff, 3, 0, 0);
        this.perpCamera.add(pointLight);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.autoClear = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        window.addEventListener('resize', this.onWindowResize.bind(this));

        const controls = new OrbitControls(this.perpCamera, this.renderer.domElement);
        controls.addEventListener('change', this.three_render.bind(this));

        const gui = new GUI();

        gui.add(this.params, 'colorMap', ['rainbow', 'cooltowarm', 'blackbody', 'grayscale']).onChange(() => {
            this.updateColors();
            this.three_render();
        });
    }

    onWindowResize() {
        const width = this.containerWidth;
        const height = this.containerHeight;

        this.perpCamera.aspect = width / height;
        this.perpCamera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.three_render();
    }

    three_render() {
        this.renderer.clear();
        this.renderer.render(this.scene, this.perpCamera);
        this.renderer.render(this.uiScene, this.orthoCamera);
    }

    loadModel() {
        const loader = new THREE.BufferGeometryLoader();
        loader.load('models/json/pressure.json', geometry => {
                geometry.center();
                geometry.computeVertexNormals();

                // default color attribute
                const colors = [];

                for (let i = 0, n = geometry.attributes.position.count; i < n; ++i) {
                    colors.push(1, 1, 1);
                }

                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                this.mesh.geometry = geometry;
                this.updateColors();

                this.three_render();
            }
        );
    }

    updateColors() {
        this.lut.setColorMap(this.params.colorMap);

        this.lut.setMax(2000);
        this.lut.setMin(0);

        const geometry = this.mesh.geometry;
        const pressures = geometry.attributes.pressure;
        const colors = geometry.attributes.color;
        const color = new THREE.Color();

        for (let i = 0; i < pressures.array.length; i++) {
            const colorValue = pressures.array[i];

            color.copy(this.lut.getColor(colorValue)).convertSRGBToLinear();

            colors.setXYZ(i, color.r, color.g, color.b);
        }

        colors.needsUpdate = true;

        const map = this.sprite.material.map;
        this.lut.updateCanvas(map.image);
        map.needsUpdate = true;
    }
}

customElements.define('webgl-geometry-colors-lookuptable', WebglGeometryColorsLookuptable);