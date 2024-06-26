// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('vtk-element')
export class VtkElement extends LitElement {
    // ----------------------------------------------------------------------------
    // Standard rendering code setup
    // ----------------------------------------------------------------------------

    private renderWindow: vtkRenderWindow;
    private readonly renderer: vtkRenderer;
    private readonly openGLRenderWindow: vtkOpenGLRenderWindow;

    constructor() {
        super();

        this.renderWindow = vtkRenderWindow.newInstance();
        this.renderer = vtkRenderer.newInstance({background: [0.2, 0.3, 0.4]});

        this.renderWindow.addRenderer(this.renderer);

        // ----------------------------------------------------------------------------
        // Simple pipeline ConeSource --> Mapper --> Actor
        // ----------------------------------------------------------------------------

        const coneSource = vtkConeSource.newInstance({height: 1.0});

        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(coneSource.getOutputPort());

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);

        // ----------------------------------------------------------------------------
        // Add the actor to the renderer and set the camera based on it
        // ----------------------------------------------------------------------------

        this.renderer.addActor(actor);
        this.renderer.resetCamera();

        // ----------------------------------------------------------------------------
        // Use OpenGL as the backend to view the all this
        // ----------------------------------------------------------------------------

        this.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
        this.renderWindow.addView(this.openGLRenderWindow);
    }

    createRenderRoot(): HTMLElement | DocumentFragment {
        return super.createRenderRoot();
    }

    firstUpdated() {
        // ----------------------------------------------------------------------------
        // Create a div section to put this into
        // ----------------------------------------------------------------------------
        const container = <HTMLElement>this.renderRoot.querySelector('#container')!;
        this.openGLRenderWindow.setContainer(container);

        // ----------------------------------------------------------------------------
        // Capture size of the container and set it to the renderWindow
        // ----------------------------------------------------------------------------
        const {width, height} = container.getBoundingClientRect();
        this.openGLRenderWindow.setSize(width, height);

        // ----------------------------------------------------------------------------
        // Setup an interactor to handle mouse events
        // ----------------------------------------------------------------------------
        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setView(this.openGLRenderWindow);
        interactor.initialize();
        interactor.bindEvents(container);

        // ----------------------------------------------------------------------------
        // Setup interactor style to use
        // ----------------------------------------------------------------------------
        interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    }

    render() {
        return html`
            <div id="container"></div>`;
    }
}
