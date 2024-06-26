package com.eugentia.app.components;

import com.vaadin.flow.component.formlayout.FormLayout;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.upload.SucceededEvent;
import com.vaadin.flow.component.upload.Upload;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.*;

public class ExcelUploadComponent extends FormLayout {
    private final Upload upload;
    protected OutputStream outputStream;
    protected XSSFWorkbook workbook;
    protected InputStream inputStream;

    public ExcelUploadComponent() {
        // create the upload component and delegate actions to the receiveUpload method
        upload = new Upload(this::receiveUpload);
        upload.setAcceptedFileTypes("application/xlsx", ".xlsx");
        upload.getStyle().set("flex-grow", "1");

        // listen to state changes
        upload.addSucceededListener(this::uploadSuccess);

        upload.addFailedListener(e -> setFailed(e.getReason().getMessage()));
        upload.addFileRejectedListener(e -> setFailed(e.getErrorMessage()));

        // only allow single file at a time
        upload.setMaxFiles(1);

        // set max file size to 1 MB
        upload.setMaxFileSize(1024 * 1024 * 1024);

        add(upload);
    }

    /**
     * Called when a user initializes an upload.
     * <p>
     * We prepare the bean and a destination for the binary data; Vaadin will take
     * care of the actual network operations.
     */
    private OutputStream receiveUpload(String fileName, String mimeType) {
        // set up receiving Stream
        outputStream = new ByteArrayOutputStream();
        return outputStream;
    }

    /**
     * Called when an upload is successfully completed.
     */
    private void uploadSuccess(SucceededEvent e) {
        //Create Workbook instance holding reference to .xlsx file
        var buffer = (ByteArrayOutputStream) outputStream;
        inputStream = new ByteArrayInputStream(buffer.toByteArray());

        try {
            workbook = new XSSFWorkbook(inputStream);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }

        readExcel();

        // clear the upload component 'finished files' list for a cleaner appearance.
        // there is yet no API for it on the server side, see
        // https://github.com/vaadin/vaadin-upload-flow/issues/96
        upload.getElement().executeJs("this.files=[]");
    }

    /**
     * Shows an error message to the user.
     */
    private void setFailed(String message) {
        Notification notification = Notification.show(message);
        notification.addThemeVariants(NotificationVariant.LUMO_ERROR);
    }

    protected void readExcel() {
    }
}