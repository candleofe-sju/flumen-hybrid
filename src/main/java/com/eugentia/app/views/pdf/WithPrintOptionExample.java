package com.eugentia.app.views.pdf;

import com.vaadin.componentfactory.pdfviewer.PdfViewer;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.StreamResource;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("With Print")
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/address-book.svg", order = 17)
@Route(value = "with-print")
public class WithPrintOptionExample extends VerticalLayout {

    public WithPrintOptionExample() {
        setSizeFull();

        PdfViewer pdfViewer = new PdfViewer();
        pdfViewer.setSizeFull();
        StreamResource resource = new StreamResource("example.pdf", () -> getClass().getResourceAsStream("/pdf/example.pdf"));
        pdfViewer.setSrc(resource);
        pdfViewer.setAddPrintButton(true);
        add(pdfViewer);
    }

}
