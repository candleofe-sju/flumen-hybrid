import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { DragControls } from 'three/addons/controls/DragControls.js';

export class MiscControlsDrag extends LitElement {
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
        let enableSelection = false;

        this.objects = [];

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.init();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = this.containerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(70, this.containerWidth / this.containerHeight, 0.1, 500);
        this.camera.position.z = 25;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        this.scene.add(new THREE.AmbientLight(0xaaaaaa));

        const light = new THREE.SpotLight(0xffffff, 10000);
        light.position.set(0, 25, 50);
        light.angle = Math.PI / 9;

        light.castShadow = true;
        light.shadow.camera.near = 10;
        light.shadow.camera.far = 100;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        this.scene.add(light);

        this.group = new THREE.Group();
        this.scene.add(this.group);

        const geometry = new THREE.BoxGeometry();

        for (let i = 0; i < 200; i++) {

            const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

            object.position.x = Math.random() * 30 - 15;
            object.position.y = Math.random() * 15 - 7.5;
            object.position.z = Math.random() * 20 - 10;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.x = Math.random() * 2 + 1;
            object.scale.y = Math.random() * 2 + 1;
            object.scale.z = Math.random() * 2 + 1;

            object.castShadow = true;
            object.receiveShadow = true;

            this.scene.add(object);

            this.objects.push(object);
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.controls = new DragControls([...this.objects], this.camera, this.renderer.domElement);
        this.controls.addEventListener('drag', event => this.three_render());

        //
        window.addEventListener('resize', event => this.onWindowResize());

        document.addEventListener('click', event => this.onClick());
        window.addEventListener('keydown', event => this.onKeyDown());
        window.addEventListener('keyup', event => this.onKeyUp(event));

        this.three_render();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.three_render();
    }

    onKeyDown(event) {
        this.enableSelection = event.keyCode === 16;
    }

    onKeyUp() {
        this.enableSelection = false;
    }

    onClick(event) {
        event.preventDefault();
        if (this.enableSelection) {
            const draggableObjects = controls.getObjects();
            draggableObjects.length = 0;

            this.mouse.x = (event.clientX / this.containerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / this.containerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            const intersections = this.raycaster.intersectObjects(this.objects, true);

            if (intersections.length > 0) {
                const object = intersections[0].object;

                object.material.emissive.set(this.group.children.includes(object) ? 0x000000 : 0xaaaaaa);
                this.group.attach(object);

                this.controls.transformGroup = true;
                draggableObjects.push(this.group);
            }

            if (this.group.children.length === 0) {
                this.controls.transformGroup = false;
                draggableObjects.push(...this.objects);
            }
        }

        this.three_render();
    }

    three_render() {
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('misc-controls-drag', MiscControlsDrag);
