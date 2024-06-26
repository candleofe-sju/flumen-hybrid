import { css, html, LitElement } from "lit";
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export class MiscAnimationGroup extends LitElement {
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
        this.stats = null;
        this.clock = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mixer = null;
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        this.init();
        this.animate();
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.scene = new THREE.Scene();

        //
        this.camera = new THREE.PerspectiveCamera(40, this.containerWidth / this.containerHeight, 1, 1000);
        this.camera.position.set(50, 50, 100);
        this.camera.lookAt(this.scene.position);

        // all objects of this animation group share a common animation state
        const animationGroup = new THREE.AnimationObjectGroup();

        //
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const material = new THREE.MeshBasicMaterial({ transparent: true });

        //
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.x = 32 - (16 * i);
                mesh.position.y = 0;
                mesh.position.z = 32 - (16 * j);

                this.scene.add(mesh);
                animationGroup.add(mesh);
            }
        }

        // create some keyframe tracks
        const xAxis = new THREE.Vector3(1, 0, 0);
        const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
        const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
        const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1, 2], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w]);

        const colorKF = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete);
        const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1]);

        // create clip
        const clip = new THREE.AnimationClip('default', 3, [quaternionKF, colorKF, opacityKF]);

        // apply the animation group to the mixer as the root object
        this.mixer = new THREE.AnimationMixer(animationGroup);

        const clipAction = this.mixer.clipAction(clip);
        clipAction.play();

        //
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        //
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        //
        this.clock = new THREE.Clock();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', event => this.onWindowResize());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onWindowResize, true);
        super.disconnectedCallback();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.three_render();
    }

    three_render() {
        const delta = this.clock.getDelta();

        if (this.mixer) {
            this.mixer.update(delta);
        }

        this.renderer.render(this.scene, this.camera);

        this.stats.update();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }
}

customElements.define('misc-animation-group', MiscAnimationGroup);