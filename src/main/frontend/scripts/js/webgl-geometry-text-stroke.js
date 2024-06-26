import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export class WebglGeometryTextStroke extends LitElement {
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
        this.camera = null;
        this.scene = null;
        this.renderer = null;
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        this.init();
    }

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 10000);
        this.camera.position.set(0, -400, 600);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        const loader = new FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', (font) => {

            const color = new THREE.Color(0x006699);

            const matDark = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            const matLite = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });

            const message = '   Three.js\nStroke text.';
            const shapes = font.generateShapes(message, 100);

            const geometry = new THREE.ShapeGeometry(shapes);
            geometry.computeBoundingBox();

            const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, 0, 0);

            // make shape ( N.B. edge view not visible )
            const text = new THREE.Mesh(geometry, matLite);
            text.position.z = -150;
            this.scene.add(text);

            // make line shape ( N.B. edge view remains visible )
            const holeShapes = [];

            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];

                if (shape.holes && shape.holes.length > 0) {
                    for (let j = 0; j < shape.holes.length; j++) {
                        const hole = shape.holes[j];
                        holeShapes.push(hole);
                    }
                }
            }

            shapes.push.apply(shapes, holeShapes);

            const style = SVGLoader.getStrokeStyle(5, color.getStyle());
            const strokeText = new THREE.Group();

            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                const points = shape.getPoints();
                const geometry = SVGLoader.pointsToStroke(points, style);

                geometry.translate(xMid, 0, 0);

                const strokeMesh = new THREE.Mesh(geometry, matDark);
                strokeText.add(strokeMesh);
            }

            this.scene.add(strokeText);
            this.three_render();

        }); //end load function

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();

        controls.addEventListener('change', this.three_render.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.three_render();
    }

    three_render() {
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('webgl-geometry-text-stroke', WebglGeometryTextStroke);