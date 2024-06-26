package com.eugentia.app.views.canvas;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
import org.vaadin.pekkam.Canvas;
import org.vaadin.pekkam.CanvasRenderingContext2D;
import org.vaadin.pekkam.event.MouseEvent;

@PageTitle("Canvas")
@Menu(icon = "", order = 17)
@Route(value = "canvas")
@RolesAllowed("USER")
public class CanvasView extends VerticalLayout {

    private static final int CANVAS_WIDTH = 800;
    private static final int CANVAS_HEIGHT = 500;

    private final CanvasRenderingContext2D ctx;

    public CanvasView() {
        Div label = new Div();
        label.setText("The quick brown fox.");

        Canvas canvas = new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.getStyle().set("border", "1px solid");

        ctx = canvas.getContext();

        HorizontalLayout buttons = new HorizontalLayout();
        buttons.add(new Button("Draw random circle",
                e -> drawRandomCircle()));
        buttons.add(new Button("Draw house", e -> drawHouse()));
        buttons.add(new Button("Clear canvas",
                e -> ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)));

        add(label, canvas, buttons);

        TextField input = new TextField("Image src: ");
        input.setValue("/resources/vaadin-logo.svg");

        HorizontalLayout imageButtons = new HorizontalLayout();
        Button loadImageButton = new Button("Load image", e -> canvas.loadImage(input.getValue()));
        Button drawImageButton = new Button("Draw image", e -> ctx.drawImage(input.getValue(), 0, 0));
        Button drawPatButton = new Button("Fill pattern", e -> drawPattern(input.getValue()));

        imageButtons.add(loadImageButton, drawImageButton, drawPatButton);

        add(input, imageButtons);

        canvas.getElement().setAttribute("tabindex", "1");
        canvas.addMouseDownListener(e -> logEvent("down", e));
        canvas.addMouseUpListener(e -> logEvent("up", e));
        canvas.addMouseMoveListener(e -> logEvent("move", e));
        canvas.addMouseClickListener(e -> logEvent("click", e));
        canvas.addMouseDblClickListener(e -> logEvent("dblClick", e));
        canvas.addKeyDownListener(e -> {
            System.out.println("key :" + e.getKey().getKeys().get(0));
        });
        canvas.addImageLoadListener(e -> System.out.println("image loaded: " + e.getSrc()));
    }

    private void logEvent(String eventType, MouseEvent me) {
        System.out.println("mouse " + eventType + ": x=" + me.getOffsetX() + ", y=" + me.getOffsetY() + ", btn=" + me.getButton());
    }

    private void drawPattern(String src) {
        ctx.save();
        ctx.setPatternFillStyle(src, "repeat");
        ctx.fillRect(200, 200, 100, 100);
        ctx.restore();
    }

    private void drawHouse() {
        ctx.save();

        ctx.setFillStyle("yellow");
        ctx.strokeRect(200, 200, 100, 100);
        ctx.fillRect(200, 200, 100, 100);

        ctx.beginPath();
        ctx.moveTo(180, 200);
        ctx.lineTo(250, 150);
        ctx.lineTo(320, 200);
        ctx.closePath();
        ctx.stroke();
        ctx.setFillStyle("orange");
        ctx.fill();

        ctx.restore();
    }

    private void drawRandomCircle() {
        ctx.save();
        ctx.setLineWidth(2);
        ctx.setFillStyle(getRandomColor());
        ctx.beginPath();
        ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT,
                10 + Math.random() * 90, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    private String getRandomColor() {
        return String.format("rgb(%s, %s, %s)", (int) (Math.random() * 256),
                (int) (Math.random() * 256), (int) (Math.random() * 256));
    }
}
