import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

export class WebglShadersOcean extends LitElement {
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

        //
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        //
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(55, this.containerWidth / this.containerHeight, 1, 20000);
        this.camera.position.set(30, 30, 100);

        //
        this.sun = new THREE.Vector3();

        // Water
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', (texture) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );

        this.water.rotation.x = -Math.PI / 2;

        this.scene.add(this.water);

        // Skybox
        this.sky = new Sky();
        this.sky.scale.setScalar(10000);
        this.scene.add(this.sky);

        const skyUniforms = this.sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        this.parameters = {
            elevation: 2,
            azimuth: 180
        };

        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.sceneEnv = new THREE.Scene();

        this.updateSun();

        //
        const geometry = new THREE.BoxGeometry(30, 30, 30);
        const material = new THREE.MeshStandardMaterial({ roughness: 0 });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        //
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxPolarAngle = Math.PI * 0.495;
        this.controls.target.set(0, 10, 0);
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;
        this.controls.update();

        //
        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        // GUI
        const gui = new GUI();

        const folderSky = gui.addFolder('Sky');
        folderSky.add(this.parameters, 'elevation', 0, 90, 0.1).onChange(value => this.updateSun());
        folderSky.add(this.parameters, 'azimuth', -180, 180, 0.1).onChange(value => this.updateSun());
        folderSky.open();

        const waterUniforms = this.water.material.uniforms;

        const folderWater = gui.addFolder('Water');
        folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
        folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
        folderWater.open();

        //
        window.addEventListener('resize', event => this.onWindowResize());
    }

    updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
        const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
        this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

        if (this.renderTarget !== undefined) this.renderTarget.dispose();

        this.sceneEnv.add(this.sky);
        this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
        this.scene.add(this.sky);

        this.scene.environment = this.renderTarget.texture;
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.three_render();
        this.stats.update();
    }

    three_render() {
        const time = performance.now() * 0.001;
        this.mesh.position.y = Math.sin(time) * 20 + 5;
        this.mesh.rotation.x = time * 0.5;
        this.mesh.rotation.z = time * 0.51;

        this.water.material.uniforms['time'].value += 1.0 / 60.0;

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-shaders-ocean', WebglShadersOcean);