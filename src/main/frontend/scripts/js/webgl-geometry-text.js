import { css, html, LitElement } from "lit";

import * as THREE from 'three';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export class WebglGeometryText extends LitElement {
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

        THREE.Cache.enabled = true;
        this.container = null;

        this.camera = null;
        this.cameraTarget = null;
        this.scene = null;
        this.renderer = null;

        this.group = null;
        this.textMesh1 = null;
        this.textMesh2 = null;
        this.textGeo = null;
        this.materials = null;

        this.firstLetter = true;

        this.text = 'three.js';

        this.bevelEnabled = true;

        this.font = undefined;

        this.fontName = 'optimer'; // helvetiker, optimer, gentilis, droid sans, droid serif
        this.fontWeight = 'bold'; // normal bold

        this.height = 20;
        this.size = 70;
        this.hover = 30;

        this.curveSegments = 4;

        this.bevelThickness = 2;
        this.bevelSize = 1.5;

        this.mirror = true;

        let fontMap = {
            'helvetiker': 0,
            'optimer': 1,
            'gentilis': 2,
            'droid/droid_sans': 3,
            'droid/droid_serif': 4
        };

        const weightMap = {
            'regular': 0,
            'bold': 1
        };

        this.reverseFontMap = [];
        this.reverseWeightMap = [];

        for (const i in fontMap) this.reverseFontMap[fontMap[i]] = i;
        for (const i in weightMap) this.reverseWeightMap[weightMap[i]] = i;

        this.targetRotation = 0;
        this.targetRotationOnPointerDown = 0;

        this.pointerXOnPointerDown = 0;

        this.fontIndex = 1;
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

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(30, this.containerWidth / this.containerHeight, 1, 1500);
        this.camera.position.set(0, 400, 700);

        this.cameraTarget = new THREE.Vector3(0, 150, 0);

        // SCENE

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 250, 1400);

        // LIGHTS
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(0, 0, 1).normalize();
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xffffff, 4.5, 0, 0);
        pointLight.color.setHSL(Math.random(), 1, 0.5);
        pointLight.position.set(0, 100, 90);
        this.scene.add(pointLight);

        this.materials = [
            new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
            new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
        ];

        this.group = new THREE.Group();
        this.group.position.y = 100;

        this.scene.add(this.group);

        this.loadFont();

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
        );
        plane.position.y = 100;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        // RENDERER
        let canvas = this.renderRoot.querySelector('#container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        // EVENTS
        canvas.style.touchAction = 'none';
        canvas.addEventListener('pointerdown', event => this.onPointerDown(this));

        document.addEventListener('keypress', event => this.onDocumentKeyPress(this));
        document.addEventListener('keydown', event => this.onDocumentKeyDown(this));

        //
        const params = {
            changeColor: () => {
                pointLight.color.setHSL(Math.random(), 1, 0.5);
            },
            changeFont: () => {
                this.fontIndex++;
                this.fontName = this.reverseFontMap[this.fontIndex % this.reverseFontMap.length];
                this.loadFont();
            },
            changeWeight: () => {
                if (this.fontWeight === 'bold') {
                    this.fontWeight = 'regular';
                } else {
                    this.fontWeight = 'bold';
                }

                this.loadFont();
            },
            changeBevel: () => {
                this.bevelEnabled = !this.bevelEnabled;
                this.refreshText();
            }
        };

        //
        const gui = new GUI();

        gui.add(params, 'changeColor').name('change color');
        gui.add(params, 'changeFont').name('change font');
        gui.add(params, 'changeWeight').name('change weight');
        gui.add(params, 'changeBevel').name('change bevel');
        gui.open();

        //
        window.addEventListener('resize', event => this.onWindowResize());
    }

    onWindowResize() {
        this.windowHalfX = this.containerWidth / 2;
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    //
    onDocumentKeyDown(event) {
        if (this.firstLetter) {
            this.firstLetter = false;
            this.text = '';
        }

        const keyCode = event.keyCode;

        // backspace
        if (keyCode === 8) {
            event.preventDefault();
            this.text = this.text.substring(0, this.text.length - 1);
            this.refreshText();

            return false;
        }
    }

    onDocumentKeyPress(event) {
        const keyCode = event.which;

        // backspace
        if (keyCode === 8) {
            event.preventDefault();
        } else {
            const ch = String.fromCharCode(keyCode);
            this.text += ch;
            this.refreshText();
        }
    }

    loadFont() {
        const loader = new FontLoader();
        loader.load('fonts/' + this.fontName + '_' + this.fontWeight + '.typeface.json', (response) => {
                this.font = response;
                this.refreshText();
            }
        );
    }

    createText() {
        this.textGeo = new TextGeometry(this.text, {
            font: this.font,
            size: this.size,
            height: this.height,
            curveSegments: this.curveSegments,
            bevelThickness: this.bevelThickness,
            bevelSize: this.bevelSize,
            bevelEnabled: this.bevelEnabled
        });

        this.textGeo.computeBoundingBox();

        const centerOffset = -0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x);

        this.textMesh1 = new THREE.Mesh(this.textGeo, this.materials);

        this.textMesh1.position.x = centerOffset;
        this.textMesh1.position.y = this.hover;
        this.textMesh1.position.z = 0;

        this.textMesh1.rotation.x = 0;
        this.textMesh1.rotation.y = Math.PI * 2;

        this.group.add(this.textMesh1);

        if (this.mirror) {
            this.textMesh2 = new THREE.Mesh(this.textGeo, this.materials);
            this.textMesh2.position.x = centerOffset;
            this.textMesh2.position.y = -this.hover;
            this.textMesh2.position.z = this.height;

            this.textMesh2.rotation.x = Math.PI;
            this.textMesh2.rotation.y = Math.PI * 2;

            this.group.add(this.textMesh2);
        }
    }

    refreshText() {
        this.group.remove(this.textMesh1);
        if (this.mirror) this.group.remove(this.textMesh2);

        if (!this.text) return;

        this.createText();
    }

    onPointerDown(event) {
        if (event.isPrimary === false) return;

        this.pointerXOnPointerDown = event.clientX - this.windowHalfX;
        this.targetRotationOnPointerDown = this.targetRotation;

        document.addEventListener('pointermove', event => this.onPointerMove(this));
        document.addEventListener('pointerup', event => this.onPointerUp(this));
    }

    onPointerMove(event) {
        if (event.isPrimary === false) return;

        let pointerX = event.clientX - this.windowHalfX;
        this.targetRotation = this.targetRotationOnPointerDown + (pointerX - this.pointerXOnPointerDown) * 0.02;
    }

    onPointerUp(event) {
        if (event.isPrimary === false) return;

        document.removeEventListener('pointermove', this.onPointerMove, true);
        document.removeEventListener('pointerup', this.onPointerUp, true);
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.three_render();
    }

    three_render() {
        this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05;

        this.camera.lookAt(this.cameraTarget);

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

    }
}

customElements.define('webgl-geometry-text', WebglGeometryText);