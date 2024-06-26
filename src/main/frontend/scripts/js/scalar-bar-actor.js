import { html, LitElement } from "lit";

import * as d3 from 'd3-scale';
import { formatDefaultLocale } from 'd3-format';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkLookupTable from "@kitware/vtk.js/Common/Core/LookupTable";
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class ScalarBarActor extends LitElement {
    constructor() {
        super();

        // ----------------------------------------------------------------------------
        // Standard rendering code setup
        // ----------------------------------------------------------------------------
        this.fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
        this.renderer = this.fullScreenRenderer.getRenderer();
        this.renderWindow = this.fullScreenRenderer.getRenderWindow();

        // ----------------------------------------------------------------------------
        // Add a cube source
        // ----------------------------------------------------------------------------
        this.cone = vtkConeSource.newInstance();
        this.cone.update();
        const npts = this.cone.getOutputData().getPoints().getNumberOfPoints();
        const scalars = vtkDataArray.newInstance({ size: npts });
        for (let i = 0; i < npts; ++i) {
            scalars.setTuple(i, [i / npts]);
        }
        this.cone.getOutputData().getPointData().setScalars(scalars);

        this.mapper = vtkMapper.newInstance();
        this.mapper.setInputData(this.cone.getOutputData());
        this.lut = this.mapper.getLookupTable();

        this.actor = vtkActor.newInstance();
        this.actor.setMapper(this.mapper);

        this.renderer.addActor(this.actor);
        this.renderer.resetCamera();
        this.renderWindow.render();

        this.scalarBarActor = vtkScalarBarActor.newInstance();
        this.renderer.addActor(this.scalarBarActor);
        this.scalarBarActor.setScalarsToColors(this.lut);

        this.params = {
            Min: 0,
            Max: 0.25,
            Automated: true,
            AxisLabel: 'Scalar Value',
            'Draw Nan Annotation': true,
            'Draw Below Swatch': true,
            'Draw Above Swatch': true
        };

        this.mapperParams = {
            'Interpolate Scalars': false,
            'Use ColorTransferFunction': false
        };

        this.scalarsToColorsParams = {
            Discretize: false,
            'Number of Colors': 256
        };
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    onMinChanged(value) {
        this.lut.setRange(value, this.lut.getRange()[1]);
        this.renderWindow.render();
    }

    onMaxChanged(value) {
        this.lut.setRange(this.lut.getRange()[0], value);
        this.renderWindow.render();
    }

    firstUpdated() {
        this.scalarBarActor.setGenerateTicks(this.generateTicks(10));

        const gui = new GUI();

        gui.add(this.params, 'Min', 0, 100, 1).onChange((value) => this.onMinChanged(value));
        gui.add(this.params, 'Max', 0, 1, 0.01).onChange((value) => this.onMaxChanged(value));
        gui.add(this.params, 'Automated').onChange((value) => {
            this.scalarBarActor.setAutomated(value);
            this.renderWindow.render();
        });
        gui.add(this.params, 'AxisLabel').onChange((value) => {
            this.scalarBarActor.setAxisLabel(value);
            this.renderWindow.render();
        });
        gui.add(this.params, 'Draw Nan Annotation').onChange((value) => {
            this.scalarBarActor.setDrawNanAnnotation(value);
            this.renderWindow.render();
        });
        gui.add(this.params, 'Draw Below Swatch').onChange((value) => {
            this.scalarBarActor.setDrawBelowRangeSwatch(value);
            this.renderWindow.render();
        });
        gui.add(this.params, 'Draw Above Swatch').onChange((value) => {
            this.scalarBarActor.setDrawAboveRangeSwatch(value);
            this.renderWindow.render();
        });

        const mapperFolder = gui.addFolder('Mapper');
        mapperFolder.add(this.mapperParams, 'Interpolate Scalars').onChange((value) => {
            this.mapper.setInterpolateScalarsBeforeMapping(value);
            this.renderWindow.render();
        });

        mapperFolder.add(this.mapperParams, 'Use ColorTransferFunction').onChange((value) => {
            if (value) {
                const discretize = this.scalarsToColorsParams.Discretize;
                const numberOfValues = parseInt(this.scalarsToColorsParams['Number of Colors'], 10);
                const ctf = vtkColorTransferFunction.newInstance({ discretize, numberOfValues, });
                ctf.addRGBPoint(1.0, 0.0, 1.0, 0.0);
                ctf.addRGBPoint(0.0, 0.0, 0.0, 1.0);
                this.mapper.setLookupTable(ctf);
            } else {
                const numberOfColors = parseInt(this.scalarsToColorsParams['Number of Colors'], 10);
                this.mapper.setLookupTable(vtkLookupTable.newInstance({ numberOfColors }));
            }
            this.lut = this.mapper.getLookupTable();
            this.scalarBarActor.setScalarsToColors(this.lut);
            this.renderWindow.render();
        });

        const scalarsToColorsFoler = gui.addFolder('ScalarsToColorsFoler');
        scalarsToColorsFoler.add(this.scalarsToColorsParams, 'Number of Colors', 1, 256, 1).onChange((value) => {
            if (this.lut.isA('vtkLookupTable')) {
                this.lut.setNumberOfColors(parseInt(value, 10));
                this.lut.modified();
                this.lut.build();
            } else {
                this.lut.setNumberOfValues(parseInt(value, 10));
            }

            this.lut.modified();
            this.scalarBarActor.setScalarsToColors(this.lut);
            this.scalarBarActor.modified();
            this.renderWindow.render();
        });
    }

    render() {
        return html`
            <canvas id="container"></canvas>
        `;
    }

    // Change the number of ticks (TODO: add numberOfTicks to ScalarBarActor)
    generateTicks(numberOfTicks) {
        return (helper) => {
            const lastTickBounds = helper.getLastTickBounds();
            // compute tick marks for axes
            const scale = d3.scaleLinear().domain([0.0, 1.0]).range([lastTickBounds[0], lastTickBounds[1]]);
            const samples = scale.ticks(numberOfTicks);
            const ticks = samples.map((tick) => scale(tick));
            // Replace minus "\u2212" with hyphen-minus "\u002D" so that parseFloat() works
            formatDefaultLocale({ minus: '\u002D' });
            const format = scale.tickFormat(ticks[0], ticks[ticks.length - 1], numberOfTicks);
            const tickStrings = ticks.map(format).map((tick) => Number(parseFloat(tick).toPrecision(12)).toPrecision()); // d3 sometimes adds unwanted whitespace
            helper.setTicks(ticks);
            helper.setTickStrings(tickStrings);
        };
    }
}

customElements.define('scalar-bar-actor', ScalarBarActor);
