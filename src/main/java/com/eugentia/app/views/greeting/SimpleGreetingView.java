package com.eugentia.app.views.greeting;

import com.eugentia.app.components.GreetingComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Simple Greeting")
@Menu(icon = "", order = 17)
@Route(value = "simple-greeting")
@RolesAllowed("USER")
public class SimpleGreetingView extends VerticalLayout {
    public SimpleGreetingView() {
        setClassName("simple-greeting-view");
        setSizeFull();

        GreetingComponent component = new GreetingComponent();
        add(component);
        component.getElement().setProperty("name", "Java");
    }
}