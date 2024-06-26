import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class WebglLightsPhysical extends LitElement {
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

        this.previousShadowMap = false;

        // ref for lumens: http://www.power-sure.com/lumens.htm
        this.bulbLuminousPowers = {
            '110000 lm (1000W)': 110000,
            '3500 lm (300W)': 3500,
            '1700 lm (100W)': 1700,
            '800 lm (60W)': 800,
            '400 lm (40W)': 400,
            '180 lm (25W)': 180,
            '20 lm (4W)': 20,
            'Off': 0
        };

        // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
        this.hemiLuminousIrradiances = {
            '0.0001 lx (Moonless Night)': 0.0001,
            '0.002 lx (Night Airglow)': 0.002,
            '0.5 lx (Full Moon)': 0.5,
            '3.4 lx (City Twilight)': 3.4,
            '50 lx (Living Room)': 50,
            '100 lx (Very Overcast)': 100,
            '350 lx (Office Room)': 350,
            '400 lx (Sunrise/Sunset)': 400,
            '1000 lx (Overcast)': 1000,
            '18000 lx (Daylight)': 18000,
            '50000 lx (Direct Sun)': 50000
        };

        this.params = {
            shadows: true,
            exposure: 0.68,
            bulbPower: Object.keys(this.bulbLuminousPowers)[4],
            hemiIrradiance: Object.keys(this.hemiLuminousIrradiances)[0]
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

        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        this.camera = new THREE.PerspectiveCamera(50, this.containerWidth / this.containerHeight, 0.1, 100);
        this.camera.position.x = -4;
        this.camera.position.z = 4;
        this.camera.position.y = 2;

        this.scene = new THREE.Scene();

        const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
        this.bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);

        this.bulbMat = new THREE.MeshStandardMaterial({
            emissive: 0xffffee,
            emissiveIntensity: 1,
            color: 0x000000
        });
        this.bulbLight.add(new THREE.Mesh(bulbGeometry, this.bulbMat));
        this.bulbLight.position.set(0, 2, 0);
        this.bulbLight.castShadow = true;
        this.scene.add(this.bulbLight);

        this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
        this.scene.add(this.hemiLight);

        this.floorMat = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            color: 0xffffff,
            metalness: 0.2,
            bumpScale: 1
        });

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('textures/hardwood2_diffuse.jpg', map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(10, 24);
                map.colorSpace = THREE.SRGBColorSpace;
                this.floorMat.map = map;
                this.floorMat.needsUpdate = true;
            }
        );

        textureLoader.load('textures/hardwood2_bump.jpg', map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(10, 24);
                this.floorMat.bumpMap = map;
                this.floorMat.needsUpdate = true;
            }
        );

        textureLoader.load('textures/hardwood2_roughness.jpg', map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(10, 24);
                this.floorMat.roughnessMap = map;
                this.floorMat.needsUpdate = true;
            }
        );

        this.cubeMat = new THREE.MeshStandardMaterial({
            roughness: 0.7,
            color: 0xffffff,
            bumpScale: 1,
            metalness: 0.2
        });

        textureLoader.load('textures/brick_diffuse.jpg', map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(1, 1);
                map.colorSpace = THREE.SRGBColorSpace;
                this.cubeMat.map = map;
                this.cubeMat.needsUpdate = true;
            }
        );

        textureLoader.load('textures/brick_bump.jpg', map => {
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(1, 1);
                this.cubeMat.bumpMap = map;
                this.cubeMat.needsUpdate = true;
            }
        );

        this.ballMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 1.0
        });

        textureLoader.load('textures/planets/earth_atmos_2048.jpg', map => {
                map.anisotropy = 4;
                map.colorSpace = THREE.SRGBColorSpace;
                this.ballMat.map = map;
                this.ballMat.needsUpdate = true;
            }
        );

        textureLoader.load('textures/planets/earth_specular_2048.jpg', map => {
                map.anisotropy = 4;
                map.colorSpace = THREE.SRGBColorSpace;
                this.ballMat.metalnessMap = map;
                this.ballMat.needsUpdate = true;
            }
        );

        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMesh = new THREE.Mesh(floorGeometry, this.floorMat);
        floorMesh.receiveShadow = true;
        floorMesh.rotation.x = -Math.PI / 2.0;
        this.scene.add(floorMesh);

        const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const ballMesh = new THREE.Mesh(ballGeometry, this.ballMat);
        ballMesh.position.set(1, 0.25, 1);
        ballMesh.rotation.y = Math.PI;
        ballMesh.castShadow = true;
        this.scene.add(ballMesh);

        const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const boxMesh = new THREE.Mesh(boxGeometry, this.cubeMat);
        boxMesh.position.set(-0.5, 0.25, -1);
        boxMesh.castShadow = true;
        this.scene.add(boxMesh);

        const boxMesh2 = new THREE.Mesh(boxGeometry, this.cubeMat);
        boxMesh2.position.set(0, 0.25, -5);
        boxMesh2.castShadow = true;
        this.scene.add(boxMesh2);

        const boxMesh3 = new THREE.Mesh(boxGeometry, this.cubeMat);
        boxMesh3.position.set(7, 0.25, 0);
        boxMesh3.castShadow = true;
        this.scene.add(boxMesh3);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 1;
        controls.maxDistance = 20;

        window.addEventListener('resize', event => this.onWindowResize());

        const gui = new GUI();

        gui.add(this.params, 'hemiIrradiance', Object.keys(this.hemiLuminousIrradiances));
        gui.add(this.params, 'bulbPower', Object.keys(this.bulbLuminousPowers));
        gui.add(this.params, 'exposure', 0, 1, 0.01);
        gui.add(this.params, 'shadows');
        gui.open();
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
    }

    three_render() {
        this.renderer.toneMappingExposure = Math.pow(this.params.exposure, 5.0); // to allow for very bright scenes.
        this.renderer.shadowMap.enabled = this.params.shadows;
        this.bulbLight.castShadow = this.params.shadows;

        if (this.params.shadows !== this.previousShadowMap) {
            this.ballMat.needsUpdate = true;
            this.cubeMat.needsUpdate = true;
            this.floorMat.needsUpdate = true;
            this.previousShadowMap = this.params.shadows;
        }

        this.bulbLight.power = this.bulbLuminousPowers[this.params.bulbPower];
        this.bulbMat.emissiveIntensity = this.bulbLight.intensity / Math.pow(0.02, 2.0); // convert from intensity to irradiance at bulb surface

        this.hemiLight.intensity = this.hemiLuminousIrradiances[this.params.hemiIrradiance];
        const time = Date.now() * 0.0005;

        this.bulbLight.position.y = Math.cos(time) * 0.75 + 1.25;

        this.renderer.render(this.scene, this.camera);

        this.stats.update();
    }
}

customElements.define('webgl-lights-physical', WebglLightsPhysical);