import { css, html, LitElement } from "lit";
import * as THREE from "three";
import Stats from 'three/addons/libs/stats.module.js';

export class WebglBuffergeometryGlbufferattribute extends LitElement {
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

        this.particles = 300000;
        this.drawCount = 10000;
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

        //
        this.renderer = new THREE.WebGLRenderer( { antialias: false, canvas: this.container } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.containerWidth, this.containerHeight );

        //
        this.camera = new THREE.PerspectiveCamera( 27, this.containerWidth / this.containerHeight, 5, 3500 );
        this.camera.position.z = 2750;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x050505 );
        this.scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

        //
        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const positions2 = [];
        const colors = [];

        const color = new THREE.Color();

        const n = 1000, n2 = n / 2; // particles spread in the cube

        for ( let i = 0; i < this.particles; i ++ ) {
            // positions
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;

            positions.push( x, y, z );
            positions2.push( z * 0.3, x * 0.3, y * 0.3 );

            // colors
            const vx = ( x / n ) + 0.5;
            const vy = ( y / n ) + 0.5;
            const vz = ( z / n ) + 0.5;

            color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );

            colors.push( color.r, color.g, color.b );
        }

        const gl = this.renderer.getContext();

        const pos = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, pos );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );

        const pos2 = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, pos2 );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions2 ), gl.STATIC_DRAW );

        const rgb = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, rgb );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

        const posAttr1 = new THREE.GLBufferAttribute( pos, gl.FLOAT, 3, 4, this.particles );
        const posAttr2 = new THREE.GLBufferAttribute( pos2, gl.FLOAT, 3, 4, this.particles );
        geometry.setAttribute( 'position', posAttr1 );

        setInterval(  () => {
            const attr = geometry.getAttribute( 'position' );

            geometry.setAttribute( 'position', ( attr === posAttr1 ) ? posAttr2 : posAttr1 );
        }, 2000 );

        geometry.setAttribute( 'color', new THREE.GLBufferAttribute( rgb, gl.FLOAT, 3, 4, this.particles ) );

        //
        const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );

        this.points = new THREE.Points( geometry, material );

        // Choose one:
        // geometry.boundingSphere = ( new THREE.Sphere() ).set( new THREE.Vector3(), Infinity );
        this.points.frustumCulled = false;

        this.scene.add( this.points );

        //
        this.stats = new Stats();
        this.container.appendChild( this.stats.dom );

        //
        window.addEventListener( 'resize', event => this.onWindowResize() );
    }

    onWindowResize() {
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.containerWidth, this.containerHeight );
    }

    //
    animate() {
        requestAnimationFrame( this.animate.bind(this) );

        this.three_render();
        this.stats.update();
    }

    three_render() {
        this.drawCount = ( Math.max( 5000, this.drawCount ) + Math.floor( 500 * Math.random() ) ) % this.particles;
        this.points.geometry.setDrawRange( 0, this.drawCount );

        const time = Date.now() * 0.001;

        this.points.rotation.x = time * 0.1;
        this.points.rotation.y = time * 0.2;

        this.renderer.render( this.scene, this.camera );
    }
}

customElements.define('webgl-buffergeometry-glbufferattribute', WebglBuffergeometryGlbufferattribute);