package com.eugentia.app.views.chart;

import com.eugentia.app.components.ChartComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Chart")
@Menu(icon = "line-awesome/svg/chart-line-solid.svg", order = 17)
@Route(value = "chart")
@RolesAllowed("USER")
public class ChartView extends VerticalLayout {
    public ChartView() {
        setClassName("chart-view");
        setSizeFull();

        ChartComponent component = new ChartComponent();
        add(component);
    }
}