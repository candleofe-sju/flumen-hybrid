import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class WebglAnimationMultiple extends LitElement {
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

        this.mixers = [];
        this.objects = [];

        this.params = {
            sharedSkeleton: false
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

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 1000);
        this.camera.position.set(2, 3, -6);
        this.camera.lookAt(0, 1, 0);

        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(-3, 10, -10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 4;
        dirLight.shadow.camera.bottom = -4;
        dirLight.shadow.camera.left = -4;
        dirLight.shadow.camera.right = 4;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        this.scene.add(dirLight);

        // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

        // ground

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({
            color: 0xcbcbcb,
            depthWrite: false
        }));
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const loader = new GLTFLoader();
        loader.load('models/gltf/Soldier.glb', (gltf) => {
            this.model = gltf.scene;
            this.animations = gltf.animations;

            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });

            this.setupDefaultScene();
        });

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.shadowMap.enabled = true;

        window.addEventListener('resize', this.onWindowResize.bind(this));

        const gui = new GUI();

        gui.add(this.params, 'sharedSkeleton').onChange(() => {
            this.clearScene();

            if (this.params.sharedSkeleton) {
                this.setupSharedSkeletonScene();
            } else {
                this.setupDefaultScene();
            }
        });
        gui.open();
    }

    clearScene() {
        for (const mixer of this.mixers) {
            mixer.stopAllAction();
        }

        this.mixers.length = 0;

        //
        for (const object of this.objects) {
            this.scene.remove(object);
            this.scene.traverse((child) => {
                if (child.isSkinnedMesh) child.skeleton.dispose();
            });
        }
    }

    setupDefaultScene() {
        // three cloned models with independent skeletons.
        // each model can have its own animation state
        const model1 = SkeletonUtils.clone(this.model);
        const model2 = SkeletonUtils.clone(this.model);
        const model3 = SkeletonUtils.clone(this.model);

        model1.position.x = -2;
        model2.position.x = 0;
        model3.position.x = 2;

        const mixer1 = new THREE.AnimationMixer(model1);
        const mixer2 = new THREE.AnimationMixer(model2);
        const mixer3 = new THREE.AnimationMixer(model3);

        mixer1.clipAction(this.animations[0]).play(); // idle
        mixer2.clipAction(this.animations[1]).play(); // run
        mixer3.clipAction(this.animations[3]).play(); // walk

        this.scene.add(model1, model2, model3);

        this.objects.push(model1, model2, model3);
        this.mixers.push(mixer1, mixer2, mixer3);
    }

    setupSharedSkeletonScene() {
        // three cloned models with a single shared skeleton.
        // all models share the same animation state

        const sharedModel = SkeletonUtils.clone(this.model);
        const shareSkinnedMesh = sharedModel.getObjectByName('vanguard_Mesh');
        const sharedSkeleton = shareSkinnedMesh.skeleton;
        const sharedParentBone = sharedModel.getObjectByName('mixamorigHips');
        this.scene.add(sharedParentBone); // the bones need to be in the scene for the animation to work

        const model1 = shareSkinnedMesh.clone();
        const model2 = shareSkinnedMesh.clone();
        const model3 = shareSkinnedMesh.clone();

        model1.bindMode = THREE.DetachedBindMode;
        model2.bindMode = THREE.DetachedBindMode;
        model3.bindMode = THREE.DetachedBindMode;

        const identity = new THREE.Matrix4();

        model1.bind(sharedSkeleton, identity);
        model2.bind(sharedSkeleton, identity);
        model3.bind(sharedSkeleton, identity);

        model1.position.x = -2;
        model2.position.x = 0;
        model3.position.x = 2;

        // apply transformation from the glTF asset
        model1.scale.setScalar(0.01);
        model1.rotation.x = -Math.PI * 0.5;
        model2.scale.setScalar(0.01);
        model2.rotation.x = -Math.PI * 0.5;
        model3.scale.setScalar(0.01);
        model3.rotation.x = -Math.PI * 0.5;

        //
        const mixer = new THREE.AnimationMixer(sharedParentBone);
        mixer.clipAction(this.animations[1]).play();

        this.scene.add(sharedParentBone, model1, model2, model3);

        this.objects.push(sharedParentBone, model1, model2, model3);
        this.mixers.push(mixer);
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth / this.containerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        for (const mixer of this.mixers) mixer.update(delta);

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-animation-multiple', WebglAnimationMultiple);