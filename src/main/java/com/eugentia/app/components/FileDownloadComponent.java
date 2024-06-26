package com.eugentia.app.components;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasStyle;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.littemplate.LitTemplate;
import com.vaadin.flow.component.template.Id;
import com.vaadin.flow.server.StreamResource;

import java.io.*;

@Tag("file-download-wrapper")
@JsModule("./scripts/lit/file-download-wrapper.ts")
public class FileDownloadComponent extends LitTemplate implements HasSize, HasStyle {

    @Id("download-link")
    protected Anchor anchor;

    protected FileDownloadComponent() {
        anchor.getElement().setAttribute("download", true);
    }

    protected FileDownloadComponent(String fileName) {
        this();
        setFileName(fileName);

    }

    public FileDownloadComponent(String fileName, File file) {
        this(fileName);
        setFile(file);
    }

    public FileDownloadComponent(String fileName, DownloadBytesProvider provider) {
        this(fileName);
        setBytesProvider(fileName, provider);
    }

    public FileDownloadComponent(StreamResource streamResource) {
        this();
        setResource(streamResource);
    }

    public void setFileName(String fileName) {
        getModel().setFileName(fileName);
    }

    public void setResource(StreamResource streamResource) {
        anchor.setHref(streamResource);
    }

    public void setBytesProvider(String fileName, DownloadBytesProvider provider) {
        setResource(new StreamResource(fileName, () -> new ByteArrayInputStream(provider.getBytes())));
    }

    public void setText(String text) {
        anchor.setText(text);
    }

    public void wrapComponent(Component component) {
        anchor.removeAll();
        if (component != null) {
            anchor.add(component);
        }
    }

    private InputStream createResource(File file) {
        try {
            return new FileInputStream(file);
        } catch (FileNotFoundException fnfe) {
            throw new IllegalArgumentException(fnfe);
        }
    }

    public void setFile(File file) {
        anchor.setHref(new StreamResource(getModel().getFileName(), () -> createResource(file)));
    }

    private FileDownloadWrapperModel getModel() {
        return new FileDownloadWrapperModel() {
            @Override
            public String getFileName() {
                return getElement().getProperty("fileName", null);
            }

            @Override
            public void setFileName(String fileName) {
                getElement().setProperty("fileName", fileName);
            }
        };
    }

    @FunctionalInterface
    public interface DownloadBytesProvider {

        byte[] getBytes();
    }

    public interface FileDownloadWrapperModel {
        String getFileName();

        void setFileName(String fileName);
    }
}