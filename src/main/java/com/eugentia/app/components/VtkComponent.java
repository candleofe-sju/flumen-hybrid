package com.eugentia.app.components;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;

@JsModule("./scripts/lit/vtk-element.ts")
@NpmPackage(value = "@kitware/vtk.js", version = "30.9.2")
@Tag("vtk-element")
public class VtkComponent extends Component implements HasSize, HasStyle {

    public VtkComponent() {
        setSizeFull();
    }
}
