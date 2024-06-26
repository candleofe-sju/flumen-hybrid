package com.eugentia.app.views.fileDownload;

import com.eugentia.app.components.FileDownloadComponent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.StreamResource;
import jakarta.annotation.security.RolesAllowed;

import java.io.ByteArrayInputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@PageTitle("File Download")
@Menu(icon = "line-awesome/svg/download-solid.svg", order = 17)
@Route(value = "file-download")
@RolesAllowed("USER")
public class FileDownloadView extends VerticalLayout {

    public FileDownloadView() {
        Button button = new Button("Click to download");

        FileDownloadComponent component = new FileDownloadComponent(setStreamResource());
        component.wrapComponent(button);
        add(component);
    }

    private StreamResource setStreamResource() {
        return new StreamResource("foo.txt", () -> new ByteArrayInputStream("foo".getBytes())) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>(super.getHeaders());
                SimpleDateFormat date = new SimpleDateFormat("yyyyMMddhhmmssSSS");
                String name = "invHistory-" + date.format(new Date()) + ".txt";
                headers.put("Content-Disposition", "attachment; filename=\"" + name + "\"");
                return headers;
            }
        };
    }
}