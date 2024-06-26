import * as THREE from 'three';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import Stats from 'three/examples/jsm/stats.module';
import { LitElement } from "lit-element";

export class CustomAttributeLines extends LitElement {
    init(font) {

        this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 400;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);

        this.uniforms = {
            amplitude: { value: 5.0 },
            opacity: { value: 0.3 },
            color: { value: new THREE.Color(0xffffff) }
        };

        const vertexShader = `
            uniform float amplitude;
    
            attribute vec3 displacement;
            attribute vec3 customColor;
    
            varying vec3 vColor;
    
            void main() {
                vec3 newPosition = position + amplitude * displacement;
                vColor = customColor;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
            }
        `;

        const fragmentShader = `
            uniform vec3 color;
            uniform float opacity;

            varying vec3 vColor;

            void main() {
                gl_FragColor = vec4( vColor * color, opacity );
            }
        `;

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });

        const geometry = new TextGeometry('three.js', {
            font: font,
            size: 50,
            height: 15,
            curveSegments: 10,
            bevelThickness: 5,
            bevelSize: 1.5,
            bevelEnabled: true,
            bevelSegments: 10,
        });

        this.geometry.center();

        const count = this.geometry.attributes.position.count;

        const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
        geometry.setAttribute('displacement', displacement);

        const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
        geometry.setAttribute('customColor', customColor);

        const color = new THREE.Color(0xffffff);

        for (let i = 0, l = customColor.count; i < l; i++) {
            color.setHSL(i / l, 0.5, 0.5);
            color.toArray(customColor.array, i * customColor.itemSize);
        }

        this.line = new THREE.Line(geometry, shaderMaterial);
        this.line.rotation.x = 0.2;
        this.scene.add(this.line);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const container = this.renderRoot.querySelector('#container');
        container.appendChild(this.renderer.domElement);

        this.stats = new Stats();
        container.appendChild(this.stats.dom);

        //
        window.addEventListener('resize', this.onWindowResize);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    animate() {
        requestAnimationFrame(this.animate);
        this.three_render();
        this.stats.update();
    }

    three_render() {

        const time = Date.now() * 0.001;

        this.line.rotation.y = 0.25 * time;

        this.uniforms.amplitude.value = Math.sin(0.5 * time);
        this.uniforms.color.value.offsetHSL(0.0005, 0, 0);

        const attributes = this.line.geometry.attributes;
        const array = this.attributes.displacement.array;

        for (let i = 0, l = array.length; i < l; i += 3) {
            array[i] += 0.3 * (0.5 - Math.random());
            array[i + 1] += 0.3 * (0.5 - Math.random());
            array[i + 2] += 0.3 * (0.5 - Math.random());
        }

        attributes.displacement.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define('custom-attribute-lines', CustomAttributeLines);

const loader = new FontLoader();
loader.load('fonts/helvetiker_bold.typeface.json', function (font) {

    init(font);
    animate();

});

