package com.eugentia.app.views.pdf;

import com.vaadin.componentfactory.pdfviewer.PdfViewer;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.StreamResource;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Select Page")
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/address-book.svg", order = 17)
@Route(value = "select-page")
public class SelectPagePdfViewerExample extends VerticalLayout {

    public SelectPagePdfViewerExample() {
        setSizeFull();

        PdfViewer pdfViewer = new PdfViewer();
        pdfViewer.setSizeFull();
        StreamResource resource = new StreamResource("example.pdf", () -> getClass().getResourceAsStream("/pdf/example.pdf"));
        pdfViewer.setSrc(resource);
        pdfViewer.setPage(4);
        add(pdfViewer);

        HorizontalLayout layout = new HorizontalLayout();
        layout.setMargin(true);
        layout.add(new Button("Click to know current page", e -> {
            Notification.show("Current Page: " + pdfViewer.getCurrentPage());
        }));
        add(layout);
    }

}
