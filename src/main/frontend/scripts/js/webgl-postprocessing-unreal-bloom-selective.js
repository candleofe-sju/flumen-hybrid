import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class WebglPostprocessingUnrealBloomSelective extends LitElement {
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

        this.BLOOM_SCENE = 1;

        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(this.BLOOM_SCENE);

        this.params = {
            threshold: 0,
            strength: 1,
            radius: 0.5,
            exposure: 1
        };

        this.materials = {};
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

        this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, this.containerWidth / this.containerHeight, 1, 200);
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.addEventListener('change', event => this.three_render());

        const renderScene = new RenderPass(this.scene, this.camera);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = this.params.threshold;
        bloomPass.strength = this.params.strength;
        bloomPass.radius = this.params.radius;

        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(renderScene);
        this.bloomComposer.addPass(bloomPass);

        let vertexshader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
        `;

        let fragmentshader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {
    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
}
        `;

        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: vertexshader,
                fragmentShader: fragmentshader,
                defines: {}
            }), 'baseTexture'
        );
        mixPass.needsSwap = true;

        const outputPass = new OutputPass();

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(mixPass);
        this.finalComposer.addPass(outputPass);

        this.raycaster = new THREE.Raycaster();

        this.mouse = new THREE.Vector2();

        window.addEventListener('pointerdown', this.onPointerDown.bind(this));

        const gui = new GUI();

        const bloomFolder = gui.addFolder('bloom');

        bloomFolder.add(this.params, 'threshold', 0.0, 1.0).onChange((value) => {
            bloomPass.threshold = Number(value);
            this.three_render();
        });

        bloomFolder.add(this.params, 'strength', 0.0, 3).onChange((value) => {
            bloomPass.strength = Number(value);
            this.three_render();
        });

        bloomFolder.add(this.params, 'radius', 0.0, 1.0).step(0.01).onChange((value) => {
            bloomPass.radius = Number(value);
            this.three_render();
        });

        const toneMappingFolder = gui.addFolder('tone mapping');

        toneMappingFolder.add(this.params, 'exposure', 0.1, 2).onChange((value) => {
            this.renderer.toneMappingExposure = Math.pow(value, 4.0);
            this.three_render();
        });

        this.setupScene();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', event => this.onResize());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onResize, true);
        super.disconnectedCallback();
    }

    onPointerDown(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            object.layers.toggle(this.BLOOM_SCENE);
            this.three_render();
        }
    }

    onResize() {
        const width = this.containerWidth;
        const height = this.containerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.bloomComposer.setSize(width, height);
        this.finalComposer.setSize(width, height);

        this.three_render();
    }

    setupScene() {
        this.scene.traverse(this.disposeMaterial.bind(this));
        this.scene.children.length = 0;

        const geometry = new THREE.IcosahedronGeometry(1, 15);

        for (let i = 0; i < 50; i++) {
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = Math.random() * 10 - 5;
            sphere.position.y = Math.random() * 10 - 5;
            sphere.position.z = Math.random() * 10 - 5;
            sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
            sphere.scale.setScalar(Math.random() * Math.random() + 0.5);
            this.scene.add(sphere);

            if (Math.random() < 0.25) sphere.layers.enable(this.BLOOM_SCENE);
        }

        this.three_render();
    }

    disposeMaterial(obj) {
        if (obj.material) {
            obj.material.dispose();
        }
    }

    three_render() {
        this.scene.traverse(this.darkenNonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));

        // render the entire scene, then render bloom scene on top
        this.finalComposer.render();
    }

    darkenNonBloomed(obj) {
        if (obj.isMesh && !this.bloomLayer.test(obj.layers)) {
            this.materials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;
        }
    }

    restoreMaterial(obj) {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }
}

customElements.define('webgl-postprocessing-unreal-bloom-selective', WebglPostprocessingUnrealBloomSelective);