package com.eugentia.app.views.vtk;

import com.eugentia.app.components.VtkComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.PreserveOnRefresh;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("VTK")
@PreserveOnRefresh
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/chart-area-solid.svg", order = 10)
@Route(value = "vtk")
public class VtkView extends VerticalLayout {

    public VtkView() {
        addClassName("vtk-view");

        VtkComponent component = new VtkComponent();
        add(component);
    }
}
