package com.eugentia.app.components.base;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.confirmdialog.ConfirmDialog;
import com.vaadin.flow.server.StreamRegistration;
import com.vaadin.flow.server.StreamResource;
import com.vaadin.flow.server.VaadinSession;
import lombok.Setter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFDataFormat;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 *
 */
public class BaseExcelComponent extends Button {
    //첫줄 개행
    protected int rowCount;
    protected XSSFWorkbook workbook;
    protected Sheet sheet;
    protected CellStyle stringStyle;
    protected CellStyle intNumberStyle;
    protected CellStyle doubleNumberStyle;
    protected Font font;
    protected XSSFDataFormat fmt;
    protected ConfirmDialog dialog;
    protected ArrayNode arrayNode;
    @Setter
    private String fileName;

    public BaseExcelComponent(String text) {
        super(text);
        this.setConfirmDialog();
        this.addClickListener(event -> dialog.open());
    }

    protected void createDoubleNumberStyle() {
        //4.셀 스타일 및 폰트 설정(금액)
        doubleNumberStyle = workbook.createCellStyle();

        //정렬
        //우측 정렬
        doubleNumberStyle.setAlignment(HorizontalAlignment.RIGHT);

        //높이 가운데 정렬
        doubleNumberStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        //테두리 선 (우,좌,위,아래)
        doubleNumberStyle.setBorderRight(BorderStyle.THIN);
        doubleNumberStyle.setBorderLeft(BorderStyle.THIN);
        doubleNumberStyle.setBorderTop(BorderStyle.THIN);
        doubleNumberStyle.setBorderBottom(BorderStyle.THIN);

        //폰트 설정 (위 폰트 사용)
        doubleNumberStyle.setFont(font);

        //천단위 쉼표, 금액
        doubleNumberStyle.setDataFormat(fmt.getFormat("#.000000"));
    }

    /**
     *
     */
    protected void createIntNumberStyle() {
        //4.셀 스타일 및 폰트 설정(금액)
        intNumberStyle = workbook.createCellStyle();

        //정렬
        //우측 정렬
        intNumberStyle.setAlignment(HorizontalAlignment.RIGHT);

        //높이 가운데 정렬
        intNumberStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        //테두리 선 (우,좌,위,아래)
        intNumberStyle.setBorderRight(BorderStyle.THIN);
        intNumberStyle.setBorderLeft(BorderStyle.THIN);
        intNumberStyle.setBorderTop(BorderStyle.THIN);
        intNumberStyle.setBorderBottom(BorderStyle.THIN);

        //폰트 설정 (위 폰트 사용)
        intNumberStyle.setFont(font);

        //천단위 쉼표, 금액
        intNumberStyle.setDataFormat(fmt.getFormat("#,##0"));
    }

    /**
     *
     */
    protected void createStringStyle() {
        //4.셀 스타일 및 폰트 설정(일반 텍스트)
        stringStyle = workbook.createCellStyle();

        //정렬
        stringStyle.setAlignment(HorizontalAlignment.CENTER);

        //가운데 정렬
        stringStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        //높이 가운데 정렬
        //테두리 선 (우,좌,위,아래)
        stringStyle.setBorderRight(BorderStyle.THIN);
        stringStyle.setBorderLeft(BorderStyle.THIN);
        stringStyle.setBorderTop(BorderStyle.THIN);
        stringStyle.setBorderBottom(BorderStyle.THIN);

        //폰트 설정 (위 폰트 사용)
        stringStyle.setFont(font);
    }

    /**
     *
     */
    protected void createHeader() {
        rowCount = 1;

        List<String> headers = getKeys();

        //3.셀 스타일 및 폰트 설정
        CellStyle style = workbook.createCellStyle();

        //정렬
        //가운데 정렬
        style.setAlignment(HorizontalAlignment.CENTER);

        //높이 가운데 정렬
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        //배경색
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        //테두리 선 (우,좌,위,아래)
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);

        //사이즈
        style.setFont(font);

        //2열 작성
        Row row = sheet.createRow(rowCount++);

        int cellCount = 0;

        for (String header : headers) {
            Cell cell = row.createCell(cellCount++);
            cell.setCellStyle(style);
            cell.setCellValue(header);
        }
    }

    /**
     * @return
     */
    private byte[] generateExcel() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook = new XSSFWorkbook();
        fmt = workbook.createDataFormat();
        generateWorkbook();

        try {
            workbook.write(outputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return outputStream.toByteArray();
    }

    /**
     *
     */
    protected void setConfirmDialog() {
        dialog = new ConfirmDialog();

        dialog.setHeader("Download Excel?");
        dialog.setConfirmText("OK");
        dialog.setCancelText("Cancel");
        dialog.setCancelable(true);

        dialog.addConfirmListener(confirmEvent -> {
            final byte[] byteArray = generateExcel();
            this.downloadExcel(byteArray);
        });
    }

    /**
     * @param byteArray
     */
    protected void downloadExcel(byte[] byteArray) {
        final StreamResource resource = new StreamResource(fileName, () -> new ByteArrayInputStream(byteArray));
        final StreamRegistration registration = VaadinSession.getCurrent().getResourceRegistry().registerResource(resource);
        UI.getCurrent().getPage().open(registration.getResourceUri().toString());
    }

    /**
     * @return
     */
    private List<String> getKeys() {
        this.getArrayNode();

        List<String> keys = null;

        if (!arrayNode.isEmpty()) {
            keys = new ArrayList<>();
            Iterator<String> iterator = arrayNode.get(1).fieldNames();

            iterator.forEachRemaining(keys::add);
        }

        return keys;
    }

    /**
     *
     */
    protected void generateWorkbook() {
        this.generateData();

        this.setFont();

        this.createDoubleNumberStyle();

        this.createIntNumberStyle();

        this.createStringStyle();

        this.setCellStyle();

        //눈금선 없애기
        sheet.setDisplayGridlines(false);

        this.createHeader();

        this.setData();
    }

    /**
     *
     */
    protected void setFont() {
    }

    /**
     *
     */
    protected void setCellStyle() {
    }

    /**
     *
     */
    protected void getArrayNode() {
    }

    /**
     *
     */
    protected void generateData() {
    }

    /**
     *
     */
    protected void setData() {
    }
}
