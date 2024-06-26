package com.eugentia.app.components;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;

@NpmPackage(value = "@cherie-xf/lit-echarts", version="1.0.3")
@JsModule(value = "./scripts/js/chart-element.js")
@Tag("chart-element")
public class ChartComponent extends Component implements HasSize, HasStyle {
    public ChartComponent() {
        setSizeFull();
    }
}
