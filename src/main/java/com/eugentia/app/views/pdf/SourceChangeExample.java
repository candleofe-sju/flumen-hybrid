package com.eugentia.app.views.pdf;

import com.vaadin.componentfactory.pdfviewer.PdfViewer;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.StreamResource;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Source Change")
@RolesAllowed("USER")
@Menu(icon = "line-awesome/svg/address-book.svg", order = 17)
@Route(value = "source-change")
public class SourceChangeExample extends VerticalLayout {

    public SourceChangeExample() {
        setSizeFull();

        PdfViewer pdfViewer = new PdfViewer();
        pdfViewer.setSizeFull();

        ComboBox<String> filesComboBox = new ComboBox<>("Select PDF");
        filesComboBox.setWidth("300px");
        filesComboBox.setPlaceholder("Select a file");
        filesComboBox.setItems("bitcoin.pdf", "example.pdf", "example-invoice.pdf");
        filesComboBox.addValueChangeListener(e -> {
            String filename = e.getValue();
            StreamResource resource = new StreamResource(filename,
                    () -> getClass().getResourceAsStream("/pdf/" + filename));
            pdfViewer.setSrc(resource);
        });

        add(filesComboBox, pdfViewer);
    }

}
