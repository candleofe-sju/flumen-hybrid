import { html, LitElement } from "lit";

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Molecule'; // vtkStickMapper

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPlaneSource from '@kitware/vtk.js/Filters/Sources/PlaneSource';
import vtkStickMapper from '@kitware/vtk.js/Rendering/Core/StickMapper';

import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class StickMapper extends LitElement {
    constructor() {
        super();
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);

        // ----------------------------------------------------------------------------
        // Standard rendering code setup
        // ----------------------------------------------------------------------------

        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
            background: [0, 0, 0],
        });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();

        // ----------------------------------------------------------------------------
        // Example code
        // ----------------------------------------------------------------------------
        const planeSource = vtkPlaneSource.newInstance();
        const simpleFilter = vtkCalculator.newInstance();
        const mapper = vtkStickMapper.newInstance();
        const actor = vtkActor.newInstance();

        simpleFilter.setFormula({
            getArrays: (inputDataSets) => ({
                input: [{ location: FieldDataTypes.COORDINATE }], // Require point coordinates as input
                output: [
                    // Generate two output arrays:
                    {
                        location: FieldDataTypes.POINT, // This array will be point-data ...
                        name: 'orientation', // ... with the given name ...
                        dataType: 'Float32Array', // ... of this type ...
                        numberOfComponents: 3, // ... with this many components ...
                    },
                    {
                        location: FieldDataTypes.POINT, // This array will be field data ...
                        name: 'temperature', // ... with the given name ...
                        dataType: 'Float32Array', // ... of this type ...
                        attribute: AttributeTypes.SCALARS, // ... and will be marked as the default scalars.
                        numberOfComponents: 1, // ... with this many components ...
                    },
                    {
                        location: FieldDataTypes.POINT, // This array will be field data ...
                        name: 'pressure', // ... with the given name ...
                        dataType: 'Float32Array', // ... of this type ...
                        numberOfComponents: 2, // ... with this many components ...
                    },
                ],
            }),
            evaluate: (arraysIn, arraysOut) => {
                // Convert in the input arrays of vtkDataArrays into variables
                // referencing the underlying JavaScript typed-data arrays:
                const [coords] = arraysIn.map((d) => d.getData());
                const [orient, temp, press] = arraysOut.map((d) => d.getData());

                // Since we are passed coords as a 3-component array,
                // loop over all the points and compute the point-data output:
                for (let i = 0, sz = coords.length / 3; i < sz; ++i) {
                    orient[i * 3] =
                        (coords[3 * i] - 0.5) * (coords[3 * i] - 0.5) +
                        (coords[3 * i + 1] - 0.5) * (coords[3 * i + 1] - 0.5);
                    orient[i * 3 + 1] =
                        (coords[3 * i] - 0.5) * (coords[3 * i] - 0.5) +
                        (coords[3 * i + 1] - 0.5) * (coords[3 * i + 1] - 0.5);
                    orient[i * 3 + 2] = 1.0;

                    temp[i] = coords[3 * i + 1];

                    press[i * 2] =
                        (coords[3 * i] * coords[3 * i] +
                            coords[3 * i + 1] * coords[3 * i + 1]) *
                        0.05 +
                        0.05;
                    press[i * 2 + 1] =
                        (coords[3 * i] * coords[3 * i] +
                            coords[3 * i + 1] * coords[3 * i + 1]) *
                        0.01 +
                        0.01;
                }
                // Mark the output vtkDataArray as modified
                arraysOut.forEach((x) => x.modified());
            },
        });

        // The generated 'temperature' array will become the default scalars, so the plane mapper will color by 'temperature':
        simpleFilter.setInputConnection(planeSource.getOutputPort());

        mapper.setInputConnection(simpleFilter.getOutputPort());

        mapper.setOrientationArray('orientation');
        mapper.setScaleArray('pressure');

        actor.setMapper(mapper);

        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();

        // -----------------------------------------------------------
        // UI control handling
        // -----------------------------------------------------------
        const params = {
            'X Resolution': 11,
            'Y Resolution': 11
        };

        const gui = new GUI();

        gui.add(params, 'X Resolution', 2, 26, 1).onChange(value => {
            debugger;
            planeSource.set({ xResolution: value - 1 });
            renderWindow.render();
        });

        gui.add(params, 'Y Resolution', 2, 26, 1).onChange(value => {
            debugger;
            planeSource.set({ yResolution: value - 1 });
            renderWindow.render();
        });
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }
}

customElements.define('stick-mapper', StickMapper);
