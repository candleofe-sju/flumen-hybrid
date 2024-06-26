package com.eugentia.app.components;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;

@JsModule(value = "./scripts/lit/simple-greeting.ts")
@Tag("simple-greeting")
public class GreetingComponent extends Component implements HasSize, HasStyle {
    public GreetingComponent() {
        setSizeFull();
    }
}
