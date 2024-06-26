package com.eugentia.app.components;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.dom.Element;

@Tag("barcode-element")
// wrapper is needed as an element to set svg-code as 'innerHTML'
public class BarcodeComponent extends Component implements HasSize, HasStyle {
    public BarcodeComponent() {
        setSizeFull();
    }

    public void setContent(String svgContent) {
        Element element = this.getElement();
        element.getNode().runWhenAttached(ui -> ui.beforeClientResponse(this, executionContext -> element.setProperty("innerHTML", svgContent)));
    }
}
