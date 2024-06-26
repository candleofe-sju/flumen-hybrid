package com.eugentia.app.views.react;

import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.react.ReactAdapterComponent;
import com.vaadin.flow.function.SerializableConsumer;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import elemental.json.JsonObject;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("RGBA Color Picker")
@NpmPackage(value = "react-colorful", version = "5.6.1")
@JsModule("./scripts/react/rgba-color-picker.tsx")
@Menu(icon = "line-awesome/svg/cubes-solid.svg", order = 17)
@RolesAllowed("USER")
@Route("rgba-color-picker")
@Tag("rgba-color-picker")
public class RgbaColorPicker extends ReactAdapterComponent {

    public RgbaColorPicker() {
        setColor(new RgbaColor(255, 0, 0, 0.5));
    }

    public RgbaColor getColor() {
        return getState("color", RgbaColor.class);
    }

    public void setColor(RgbaColor color) {
        setState("color", color);
    }

    public void addColorChangeListener(SerializableConsumer<RgbaColor> listener) {
        addStateChangeListener("color", RgbaColor.class, listener);
    }

    public void addPersonDataUpdateListener() {
        getElement().addEventListener("update", event -> {
            JsonObject person = event.getEventData();
            // person update code goes here...
        }).addEventData("event.detail");
    }
}
