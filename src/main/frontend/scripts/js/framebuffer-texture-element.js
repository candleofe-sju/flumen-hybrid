import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils';
import { html, LitElement } from "lit";

export class FramebufferTextureElement extends LitElement {
    constructor() {
        super();

        this.offset = 0;

        this.dpr = window.devicePixelRatio;

        this.textureSize = 128 * dpr;
        this.vector = new THREE.Vector2();
        this.color = new THREE.Color();
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this.init();
        this.animate();
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    init() {
        //
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
        this.camera.position.z = 20;

        this.cameraOrtho = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 10);
        this.cameraOrtho.position.z = 10;

        this.scene = new THREE.Scene();
        this.sceneOrtho = new THREE.Scene();

        //
        const points = GeometryUtils.gosper(8);

        const geometry = new THREE.BufferGeometry();
        const positionAttribute = new THREE.Float32BufferAttribute(points, 3);
        geometry.setAttribute('position', positionAttribute);
        geometry.center();

        const colorAttribute = new THREE.BufferAttribute(new Float32Array(positionAttribute.array.length), 3);
        colorAttribute.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('color', colorAttribute);

        const material = new THREE.LineBasicMaterial({ vertexColors: true });

        this.line = new THREE.Line(geometry, material);
        this.line.scale.setScalar(0.05);
        this.scene.add(this.line);

        //
        this.texture = new THREE.FramebufferTexture(this.textureSize, this.textureSize);

        //
        const spriteMaterial = new THREE.SpriteMaterial({ map: this.texture });
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(this.textureSize, this.textureSize, 1);
        this.sceneOrtho.add(this.sprite);

        this.updateSpritePosition();

        //
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.autoClear = false;
        document.body.appendChild(this.renderer.domElement);

        //
        this.selection = document.getElementById('selection');
        const controls = new OrbitControls(this.camera, this.selection);
        controls.enablePan = false;

        //
        window.addEventListener('resize', this.onWindowResize);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.cameraOrtho.left = -width / 2;
        this.cameraOrtho.right = width / 2;
        this.cameraOrtho.top = height / 2;
        this.cameraOrtho.bottom = -height / 2;
        this.cameraOrtho.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        this.updateSpritePosition();
    }

    updateSpritePosition() {
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;

        const halfImageWidth = this.textureSize / 2;
        const halfImageHeight = this.textureSize / 2;

        this.sprite.position.set(-halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const colorAttribute = this.line.geometry.getAttribute('color');
        this.updateColors(colorAttribute);

        // scene rendering

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        // calculate start position for copying data

        this.vector.x = (window.innerWidth * this.dpr / 2) - (this.textureSize / 2);
        this.vector.y = (window.innerHeight * this.dpr / 2) - (this.textureSize / 2);

        this.renderer.copyFramebufferToTexture(this.vector, this.texture);

        this.renderer.clearDepth();
        this.renderer.render(this.sceneOrtho, this.cameraOrtho);
    }

    updateColors(colorAttribute) {
        const l = colorAttribute.count;

        for (let i = 0; i < l; i++) {
            const h = ((this.offset + i) % l) / l;

            this.color.setHSL(h, 1, 0.5);
            colorAttribute.setX(i, this.color.r);
            colorAttribute.setY(i, this.color.g);
            colorAttribute.setZ(i, this.color.b);
        }

        colorAttribute.needsUpdate = true;

        this.offset -= 25;
    }
}

customElements.define('framebuffer-texture-element', FramebufferTextureElement);