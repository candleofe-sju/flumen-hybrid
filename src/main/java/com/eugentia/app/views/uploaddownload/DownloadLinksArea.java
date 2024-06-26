package com.eugentia.app.views.uploaddownload;

import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.H4;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.server.StreamResource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Objects;

public class DownloadLinksArea extends VerticalLayout {

    private final File uploadFolder;

    public DownloadLinksArea(File uploadFolder) {
        this.uploadFolder = uploadFolder;
        refreshFileLinks();
        setMargin(true);
    }

    public void refreshFileLinks() {
        removeAll();
        add(new H4("Download Links:"));

        for (File file : Objects.requireNonNull(uploadFolder.listFiles())) {
            addLinkToFile(file);
        }
    }

    /**
     * @param file
     * @return
     */
    private String formatFileSize(File file) {
        long size = file.length();
        int i = 0;

        String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};

        long formattedSize = 0;

        for (; size >= 1024 && i < 4; i++) {
            size /= 1024;
            formattedSize = Math.round(size);
        }

        return String.format("%s (%d %s)", file.getName(), formattedSize, units[i]);
    }

    private void addLinkToFile(File file) {
        StreamResource streamResource = new StreamResource(file.getName(), () -> getStream(file));
        Anchor link = new Anchor(streamResource, formatFileSize(file));
        link.getElement().setAttribute("download", true);
        add(link);
    }

    private InputStream getStream(File file) {
        FileInputStream stream = null;
        try {
            stream = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return stream;
    }
}
