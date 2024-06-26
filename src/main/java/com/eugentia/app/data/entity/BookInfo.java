package com.eugentia.app.data.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class BookInfo {
    @JsonProperty("ID")
    private String bookId;

    @JsonProperty("도서명")
    private String name;

    @JsonProperty("작가")
    private String author;

    @JsonProperty("가격")
    private double price;

    @JsonProperty("수량")
    private int count;

    @Override
    public String toString() {
        return "Book [bookId=" + bookId + ", name=" + name + ", author=" + author + ", price=" + price
                + ", count=" + count + "]";
    }
}
