package com.eugentia.app.views.pdf;

import com.vaadin.componentfactory.pdfviewer.PdfViewer;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.StreamResource;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Rendering Interactive Forms")
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/address-book.svg", order = 17)
@Route(value = "rendering-interactive-forms")
public class RenderingInteractiveFormsExample extends VerticalLayout {

    public RenderingInteractiveFormsExample() {
        setSizeFull();

        PdfViewer pdfViewer = new PdfViewer();
        pdfViewer.setSizeFull();
        StreamResource resource = new StreamResource("Pdf Form Example", () -> getClass().getResourceAsStream("/pdf/pdf-form-example.pdf"));
        pdfViewer.setSrc(resource);
        pdfViewer.setRenderInteractiveForms(false);
        add(pdfViewer);
    }

}
