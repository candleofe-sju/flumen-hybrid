package com.eugentia.app.views.three;

import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.PreserveOnRefresh;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("ThreeJS")
@NpmPackage(value = "three", version = "0.165.0")
@PreserveOnRefresh
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/chart-area-solid.svg", order = 17)
@Route(value = "three")
@JsModule("./scripts/js/webgl-buffergeometry-instancing.js")
@Tag("webgl-buffergeometry-instancing")
public class WebglBufferGeometryInstancingView extends VerticalLayout {

    public WebglBufferGeometryInstancingView() {
        addClassName("webgl-buffergeometry-instancing-view");
        setSizeFull();
        setPadding(true);
    }
}