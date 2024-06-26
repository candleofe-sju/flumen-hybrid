import * as THREE from "three";
import { css, html, LitElement } from "lit";

export class InteractiveBuffergeometry extends LitElement {
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
        this.init();

        this.container = this.renderRoot.querySelector('#container');
        this.diff = window.innerWidth - this.container.getBoundingClientRect().width;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.containerWidth, this.containerHeight);

        this.animate();
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(27, this.containerWidth / this.containerHeight, 1, 3500);
        this.camera.position.z = 2750;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.Fog(0x050505, 2000, 3500);

        this.scene.add(new THREE.AmbientLight(0x444444, 3));

        const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
        light1.position.set(1, 1, 1);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 4.5);
        light2.position.set(0, -1, 0);
        this.scene.add(light2);

        const triangles = 5000;

        let geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(triangles * 3 * 3);
        const normals = new Float32Array(triangles * 3 * 3);
        const colors = new Float32Array(triangles * 3 * 3);

        const color = new THREE.Color();

        const n = 800, n2 = n / 2;	// triangles spread in the cube
        const d = 120, d2 = d / 2;	// individual triangle size

        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 9) {
            // positions
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;

            const ax = x + Math.random() * d - d2;
            const ay = y + Math.random() * d - d2;
            const az = z + Math.random() * d - d2;

            const bx = x + Math.random() * d - d2;
            const by = y + Math.random() * d - d2;
            const bz = z + Math.random() * d - d2;

            const cx = x + Math.random() * d - d2;
            const cy = y + Math.random() * d - d2;
            const cz = z + Math.random() * d - d2;

            positions[i] = ax;
            positions[i + 1] = ay;
            positions[i + 2] = az;

            positions[i + 3] = bx;
            positions[i + 4] = by;
            positions[i + 5] = bz;

            positions[i + 6] = cx;
            positions[i + 7] = cy;
            positions[i + 8] = cz;

            // flat face normals
            pA.set(ax, ay, az);
            pB.set(bx, by, bz);
            pC.set(cx, cy, cz);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            cb.normalize();

            const nx = cb.x;
            const ny = cb.y;
            const nz = cb.z;

            normals[i] = nx;
            normals[i + 1] = ny;
            normals[i + 2] = nz;

            normals[i + 3] = nx;
            normals[i + 4] = ny;
            normals[i + 5] = nz;

            normals[i + 6] = nx;
            normals[i + 7] = ny;
            normals[i + 8] = nz;

            // colors
            const vx = (x / n) + 0.5;
            const vy = (y / n) + 0.5;
            const vz = (z / n) + 0.5;

            color.setRGB(vx, vy, vz);

            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;

            colors[i + 3] = color.r;
            colors[i + 4] = color.g;
            colors[i + 5] = color.b;

            colors[i + 6] = color.r;
            colors[i + 7] = color.g;
            colors[i + 8] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        geometry.computeBoundingSphere();

        let material = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            side: THREE.DoubleSide, vertexColors: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        //
        this.raycaster = new THREE.Raycaster();

        this.pointer = new THREE.Vector2();

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));

        this.material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true });

        this.line = new THREE.Line(geometry, this.material);
        this.scene.add(this.line);
    }

    render() {
        return html`
            <canvas id="container" style="width: 100%; height: 100%;"></canvas>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', event => this.onWindowResize());
        document.addEventListener('pointermove', event => this.onPointerMove(event));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onWindowResize, true);
        document.removeEventListener('pointermove', event => this.onPointerMove(event));
        super.disconnectedCallback();
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.containerWidth, this.containerHeight);
    }

    onPointerMove(event) {
        this.pointer.x = (event.clientX / this.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / this.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.three_render();
    }

    three_render() {

        const time = Date.now() * 0.001;

        this.mesh.rotation.x = time * 0.15;
        this.mesh.rotation.y = time * 0.25;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObject(this.mesh);

        if (intersects.length > 0) {

            const intersect = intersects[0];
            const face = intersect.face;

            const linePosition = this.line.geometry.attributes.position;
            const meshPosition = this.mesh.geometry.attributes.position;

            linePosition.copyAt(0, meshPosition, face.a);
            linePosition.copyAt(1, meshPosition, face.b);
            linePosition.copyAt(2, meshPosition, face.c);
            linePosition.copyAt(3, meshPosition, face.a);

            this.mesh.updateMatrix();

            this.line.geometry.applyMatrix4(this.mesh.matrix);

            this.line.visible = true;
        } else {
            this.line.visible = false;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('interactive-buffergeometry', InteractiveBuffergeometry);