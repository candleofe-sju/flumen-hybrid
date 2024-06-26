import { css, html, LitElement } from "lit";
import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export class WebglBuffergeometryInstancing extends LitElement {
    static styles = css`
        #container {
            width: 100%;
            height: 100%;
            padding: 10px;
        }
    `;

    constructor() {
        super();

        this.container = null;
        this.stats = null;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.vertexShader = `
precision highp float;

uniform float sineTime;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute vec4 orientationStart;
attribute vec4 orientationEnd;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
    vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
    vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
    vec3 vcV = cross( orientation.xyz, vPosition );
    vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
        `;
        this.fragmentShader = `
precision highp float;

uniform float time;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
    vec4 color = vec4( vColor );
    color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

    gl_FragColor = color;
}
        `;
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated(_changedProperties) {
        this.init().then(this.animate.bind(this));
    }

    async init() {
        this.container = this.renderRoot.querySelector('#container');
        debugger;

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10);
        this.camera.position.z = 2;

        this.scene = new THREE.Scene();

        // geometry
        const vector = new THREE.Vector4();

        const instances = 50000;

        const positions = [];
        const offsets = [];
        const colors = [];
        const orientationsStart = [];
        const orientationsEnd = [];

        positions.push(0.025, -0.025, 0);
        positions.push(-0.025, 0.025, 0);
        positions.push(0, 0, 0.025);

        // instanced attributes
        for (let i = 0; i < instances; i++) {
            // offsets
            offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

            // colors
            colors.push(Math.random(), Math.random(), Math.random(), Math.random());

            // orientation start
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();

            orientationsStart.push(vector.x, vector.y, vector.z, vector.w);

            // orientation end
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();

            orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);
        }

        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
        geometry.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4));
        geometry.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4));

        // material
        const material = new THREE.RawShaderMaterial({
            uniforms: {
                'time': { value: 1.0 },
                'sineTime': { value: 1.0 }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: THREE.DoubleSide,
            forceSinglePass: true,
            transparent: true
        });

        //
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        //
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (!this.renderer.capabilities.isWebGL2 && !this.renderer.extensions.has('ANGLE_instanced_arrays')) {
            document.getElementById('notSupported').style.display = '';
            return;
        }

        //
        const gui = new GUI({ width: 350 });
        gui.add(geometry, 'instanceCount', 0, instances);

        //
        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);
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
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.three_render();
        this.stats.update();
    }

    three_render() {
        const time = performance.now();
        const object = this.scene.children[0];

        object.rotation.y = time * 0.0005;
        object.material.uniforms['time'].value = time * 0.005;
        object.material.uniforms['sineTime'].value = Math.sin(object.material.uniforms['time'].value * 0.05);

        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }
}

customElements.define('webgl-buffergeometry-instancing', WebglBuffergeometryInstancing);