package com.eugentia.app.components;

import com.eugentia.app.components.base.BaseExcelComponent;
import com.eugentia.app.data.entity.BookInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ExcelComponent extends BaseExcelComponent {
    private List<BookInfo> books;

    public ExcelComponent(String text) {
        super(text);
    }

    @Override
    protected void setCellStyle() {
        //Sheet 생성
        sheet = workbook.createSheet("도서정보");

        var widths = new int[]{12, 20, 20, 20, 12};
        int column = 0;
        for (int width : widths) {
            sheet.setColumnWidth(column++, width * 256);
        }
    }

    @Override
    protected void setFont() {
        //폰트 설정
        font = workbook.createFont();
        font.setFontName("나눔고딕");

        //글씨체
        font.setFontHeight((short) (11 * 20));
    }

    @Override
    protected void getArrayNode() {
        // jackson objectMapper 객체 생성
        ObjectMapper objectMapper = new ObjectMapper();

        // List -> Json 문자열
        arrayNode = objectMapper.valueToTree(books);
    }

    @Override
    protected void generateData() {
        books = new ArrayList<>();

        books.add(new BookInfo("b1", "레미제라블", "빅토르위고", 3000.000000, 32));
        books.add(new BookInfo("b32", "홍길동", "허균", 8000.000000, 15));
    }

    @Override
    protected void setData() {
        for (BookInfo book : books) {
            Row row = sheet.createRow(rowCount++);
            int cellCount = 0;

            Cell cell = row.createCell(cellCount++);
            cell.setCellStyle(stringStyle);
            cell.setCellValue(book.getBookId());

            cell = row.createCell(cellCount++);
            cell.setCellStyle(stringStyle);
            cell.setCellValue(book.getName());

            cell = row.createCell(cellCount++);
            cell.setCellStyle(stringStyle);
            cell.setCellValue(book.getAuthor());

            cell = row.createCell(cellCount++);
            cell.setCellStyle(doubleNumberStyle);
            cell.setCellValue(book.getPrice());

            cell = row.createCell(cellCount);
            cell.setCellStyle(intNumberStyle);
            cell.setCellValue(book.getCount());
        }
    }
}
