import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils.js';

import { css, html, LitElement } from "lit";

export class WebglFramebufferTexture extends LitElement {
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

        this.offset = 0;

        this.dpr = window.devicePixelRatio;

        this.textureSize = 128 * this.dpr;
        this.vector = new THREE.Vector2();
        this.color = new THREE.Color();
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        this.init();
        this.animate();
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        const width = this.containerWidth;
        const height = this.containerHeight;

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
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        this.renderer.autoClear = false;

        //
        const selection = document.getElementById('selection');
        const controls = new OrbitControls(this.camera, selection);
        controls.enablePan = false;
    }

    render() {
        return html`
            <div id="selection"></div>
            <canvas id="container" style="width: 100%; height: 100%;"></canvas>
        `;
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
        const width = this.containerWidth;
        const height = this.containerHeight;

        this.camera.updateProjectionMatrix();

        this.cameraOrtho.left = -width / 2;
        this.cameraOrtho.right = width / 2;
        this.cameraOrtho.top = height / 2;
        this.cameraOrtho.bottom = -height / 2;

        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);

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

customElements.define('webgl-framebuffer-texture', WebglFramebufferTexture);