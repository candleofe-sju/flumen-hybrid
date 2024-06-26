package com.eugentia.app.views.chart;

import com.eugentia.app.components.BumpChartComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Bump Chart")
@Menu(icon = "line-awesome/svg/chart-line-solid.svg", order = 17)
@Route(value = "bump-chart")
@RolesAllowed("USER")
public class BumpChartView extends VerticalLayout {
    public BumpChartView() {
        setClassName("bump-chart-view");
        setSizeFull();

        BumpChartComponent component = new BumpChartComponent();
        add(component);
    }
}