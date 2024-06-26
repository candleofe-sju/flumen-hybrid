import { html, LitElement } from "lit";

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkConcentricCylinderSource from '@kitware/vtk.js/Filters/Sources/ConcentricCylinderSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class ConcentricCylinderElement extends LitElement {
    constructor() {
        super();
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        // ----------------------------------------------------------------------------
        // Standard rendering code setup
        // ----------------------------------------------------------------------------
        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
            background: [0.5, 0.5, 0.5],
        });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();

        // ----------------------------------------------------------------------------
        // Example code
        // ----------------------------------------------------------------------------
        const cylinder = vtkConcentricCylinderSource.newInstance({
            height: 0.25,
            radius: [0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
            cellFields: [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
            resolution: 60,
            skipInnerFaces: true,
        });

        const actor = vtkActor.newInstance();
        const mapper = vtkMapper.newInstance();

        actor.setMapper(mapper);
        mapper.setInputConnection(cylinder.getOutputPort());

        const lut = mapper.getLookupTable();
        lut.setValueRange([0.2, 1]);
        lut.setHueRange([0.666, 0]);

        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();

        const params = {
            'Skip Inner cells': cylinder.skipInnerFaces,
            'Start Theta': 0,
            'End Theta': 360,
            Resolution: cylinder.resolution,
            'Hide Layer 0': false,
            'Hide Layer 1': false,
            'Hide Layer 2': false,
            'Hide Layer 3': false,
            'Hide Layer 4': false,
            'Hide Layer 5': false,
            'Hide Layer 6': false,
            'Hide Layer 7': false
        };

        const layers = [
            'Hide Layer 0',
            'Hide Layer 1',
            'Hide Layer 2',
            'Hide Layer 3',
            'Hide Layer 4',
            'Hide Layer 5',
            'Hide Layer 6',
            'Hide Layer 7'
        ];

        // -----------------------------------------------------------
        // UI control handling
        // -----------------------------------------------------------
        const gui = new GUI();
        gui.add(params, 'Skip Inner cells').onChange(value => {
            cylinder.setSkipInnerFaces(value);
            renderWindow.render();
        });

        gui.add(params, 'Start Theta', 0, 360, 1).onChange(value => {
            cylinder.set({ startTheta: value });
            renderWindow.render();
        });

        gui.add(params, 'End Theta', 0, 360, 1).onChange(value => {
            cylinder.set({ endTheta: value });
            renderWindow.render();
        });

        gui.add(params, 'Resolution', 3, 100, 1).onChange(value => {
            cylinder.set({ resolution: value });
            renderWindow.render();
        });

        let id = 0;
        layers.forEach(layer => {
            cylinder.setMaskLayer(id, false);

            gui.add(params, layer).onChange(value => {
                let maskLayer = cylinder.getMaskLayer(0);
                console.log(maskLayer);
                cylinder.setMaskLayer(id, value);
                renderWindow.render();
            });

            id++;
        });
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }
}

customElements.define('concentric-cylinder-element', ConcentricCylinderElement);