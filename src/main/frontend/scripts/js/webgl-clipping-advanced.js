import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class WebglClippingAdvanced extends LitElement {
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

        // A regular tetrahedron for the clipping volume:

        this.Vertices = [
            new THREE.Vector3(+1, 0, +Math.SQRT1_2),
            new THREE.Vector3(-1, 0, +Math.SQRT1_2),
            new THREE.Vector3(0, +1, -Math.SQRT1_2),
            new THREE.Vector3(0, -1, -Math.SQRT1_2)
        ];

        this.Indices = [
            0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2
        ];

        this.Planes = this.planesFromMesh(this.Vertices, this.Indices)

        this.PlaneMatrices = this.Planes.map(this.planeToMatrix);

        this.GlobalClippingPlanes = this.cylindricalPlanes(5, 2.5);

        this.Empty = Object.freeze([]);

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.startTime = null;
        this.stats = null;

        this.object = null;
        this.clipMaterial = null;
        this.volumeVisualization = null;
        this.globalClippingPlanes = null;

        this.transform = new THREE.Matrix4();
        this.tmpMatrix = new THREE.Matrix4();
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

    planesFromMesh(vertices, indices) {
        // creates a clipping volume from a convex triangular mesh
        // specified by the arrays 'vertices' and 'indices'

        const n = indices.length / 3,
            result = new Array(n);

        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            const a = vertices[indices[j]],
                b = vertices[indices[j + 1]],
                c = vertices[indices[j + 2]];

            result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c);
        }

        return result;
    }

    createPlanes(n) {
        // creates an array of n uninitialized plane objects

        const result = new Array(n);

        for (let i = 0; i !== n; ++i)
            result[i] = new THREE.Plane();

        return result;
    }

    assignTransformedPlanes(planesOut, planesIn, matrix) {
        // sets an array of existing planes to transformed 'planesIn'

        for (let i = 0, n = planesIn.length; i !== n; ++i)
            planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
    }

    cylindricalPlanes(n, innerRadius) {
        const result = this.createPlanes(n);

        for (let i = 0; i !== n; ++i) {
            const plane = result[i],
                angle = i * Math.PI * 2 / n;

            plane.normal.set(
                Math.cos(angle), 0, Math.sin(angle));

            plane.constant = innerRadius;
        }

        return result;
    }

    planeToMatrix = (() => {
        // creates a matrix that aligns X/Y to a given plane

        // temporaries:
        const xAxis = new THREE.Vector3(),
            yAxis = new THREE.Vector3(),
            trans = new THREE.Vector3();

        return (plane) => {
            const zAxis = plane.normal,
                matrix = new THREE.Matrix4();

            // Hughes & Moeller '99
            // "Building an Orthonormal Basis from a Unit Vector."

            if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
                yAxis.set(-zAxis.y, zAxis.x, 0);
            } else {
                yAxis.set(0, -zAxis.z, zAxis.y);
            }

            xAxis.crossVectors(yAxis.normalize(), zAxis);

            plane.coplanarPoint(trans);
            return matrix.set(
                xAxis.x, yAxis.x, zAxis.x, trans.x,
                xAxis.y, yAxis.y, zAxis.y, trans.y,
                xAxis.z, yAxis.z, zAxis.z, trans.z,
                0, 0, 0, 1);
        };

    })();

    init() {
        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.camera = new THREE.PerspectiveCamera(36, this.containerWidth / this.containerHeight, 0.25, 16);

        this.camera.position.set(0, 1.5, 3);

        this.scene = new THREE.Scene();

        // Lights
        this.scene.add(new THREE.AmbientLight(0xffffff));

        const spotLight = new THREE.SpotLight(0xffffff, 60);
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.2;
        spotLight.position.set(2, 3, 3);
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 3;
        spotLight.shadow.camera.far = 10;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        this.scene.add(spotLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(0, 2, 0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;

        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = -1;
        dirLight.shadow.camera.top = 1;
        dirLight.shadow.camera.bottom = -1;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);

        // Geometry

        this.clipMaterial = new THREE.MeshPhongMaterial({
            color: 0xee0a10,
            shininess: 100,
            side: THREE.DoubleSide,
            // Clipping setup:
            clippingPlanes: this.createPlanes(this.Planes.length),
            clipShadows: true
        });

        this.object = new THREE.Group();

        const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);

        for (let z = -2; z <= 2; ++z)
            for (let y = -2; y <= 2; ++y)
                for (let x = -2; x <= 2; ++x) {
                    const mesh = new THREE.Mesh(geometry, this.clipMaterial);
                    mesh.position.set(x / 5, y / 5, z / 5);
                    mesh.castShadow = true;
                    this.object.add(mesh);
                }

        this.scene.add(this.object);

        const planeGeometry = new THREE.PlaneGeometry(3, 3, 1, 1);

        this.color = new THREE.Color();

        this.volumeVisualization = new THREE.Group();
        this.volumeVisualization.visible = false;

        for (let i = 0, n = this.Planes.length; i !== n; ++i) {

            const material = new THREE.MeshBasicMaterial({
                color: this.color.setHSL(i / n, 0.5, 0.5).getHex(),
                side: THREE.DoubleSide,

                opacity: 0.2,
                transparent: true,

                // clip to the others to show the volume (wildly
                // intersecting transparent planes look bad)
                clippingPlanes: this.clipMaterial.clippingPlanes.filter(function (_, j) {
                    return j !== i;
                })

                // no need to enable shadow clipping - the plane
                // visualization does not cast shadows
            });

            const mesh = new THREE.Mesh(planeGeometry, material);
            mesh.matrixAutoUpdate = false;

            this.volumeVisualization.add(mesh);
        }

        this.scene.add(this.volumeVisualization);

        const ground = new THREE.Mesh(planeGeometry,
            new THREE.MeshPhongMaterial({
                color: 0xa0adaf, shininess: 10
            }));
        ground.rotation.x = -Math.PI / 2;
        ground.scale.multiplyScalar(3);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Clipping setup:
        this.globalClippingPlanes = this.createPlanes(this.GlobalClippingPlanes.length);
        this.renderer.clippingPlanes = this.Empty;
        this.renderer.localClippingEnabled = true;

        // Stats
        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        // Controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 1;
        controls.maxDistance = 8;
        controls.target.set(0, 1, 0);
        controls.update();

        const gui = new GUI();

        // GUI
        this.localClippingController = {
            Enabled: true,
            Shadows: true,
            Visualize: false
        };

        const localClippingFolder = gui.addFolder('Local Clipping');
        localClippingFolder.add(this.localClippingController, "Enabled").onChange(this.localClippingChange.bind(this));
        localClippingFolder.add(this.localClippingController, "Shadows").onChange(this.localClippingChange.bind(this));
        localClippingFolder.add(this.localClippingController, "Visualize").listen().onChange(this.localClippingChange.bind(this));
        localClippingFolder.open();

        this.globalClippingControls = {
            Enabled: true
        };

        const globalClippingFolder = gui.addFolder('Global Clipping');
        globalClippingFolder.add(this.globalClippingControls, "Enabled").onChange(this.globalClippingChange.bind(this));

        // Start
        this.startTime = Date.now();
    }

    localClippingChange() {
        this.renderer.localClippingEnabled = this.localClippingController.Enabled;
        if (!this.renderer.localClippingEnabled)
            this.volumeVisualization.visible = false;

        this.clipMaterial.clipShadows = this.localClippingController.Shadows;
        this.volumeVisualization.visible = this.localClippingController.Visualize;
        if (this.renderer.localClippingEnabled)
            this.volumeVisualization.visible = this.localClippingController.Visualize;

        this.animate();
    }

    globalClippingChange() {
        this.renderer.clippingPlanes = this.globalClippingControls.Enabled ? this.globalClippingPlanes : this.Empty;
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    setObjectWorldMatrix(object, matrix) {
        // set the orientation of an object based on a world matrix
        const parent = object.parent;
        this.scene.updateMatrixWorld();
        object.matrix.copy(parent.matrixWorld).invert();
        object.applyMatrix4(matrix);
    }

    animate() {
        const currentTime = Date.now(),
            time = (currentTime - this.startTime) / 1000;

        requestAnimationFrame(this.animate.bind(this));

        this.object.position.y = 1;
        this.object.rotation.x = time * 0.5;
        this.object.rotation.y = time * 0.2;

        this.object.updateMatrix();
        this.transform.copy(this.object.matrix);

        const bouncy = Math.cos(time * .5) * 0.5 + 0.7;
        this.transform.multiply(this.tmpMatrix.makeScale(bouncy, bouncy, bouncy));

        this.assignTransformedPlanes(this.clipMaterial.clippingPlanes, this.Planes, this.transform);

        const planeMeshes = this.volumeVisualization.children;

        for (let i = 0, n = planeMeshes.length; i !== n; ++i) {
            this.tmpMatrix.multiplyMatrices(this.transform, this.PlaneMatrices[i]);
            this.setObjectWorldMatrix(planeMeshes[i], this.tmpMatrix);
        }

        this.transform.makeRotationY(time * 0.1);

        this.assignTransformedPlanes(this.globalClippingPlanes, this.GlobalClippingPlanes, this.transform);

        this.stats.begin();
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
    }
}

customElements.define('webgl-clipping-advanced', WebglClippingAdvanced);