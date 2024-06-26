package com.eugentia.app.views.math;

import com.eugentia.app.components.MathComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Math")
@Route(value = "math-view")
@Menu(icon = "line-awesome/svg/circle-solid.svg", order = 17)
@RolesAllowed("USER")
public class MathView extends VerticalLayout {

    public MathView() {
        addClassNames("math-view");
        MathComponent component = new MathComponent();
        add(component);
    }
}
