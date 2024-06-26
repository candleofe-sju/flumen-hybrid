package com.eugentia.app.data.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class Book {
	private String image;
	private String title;
	private String author;
	private Double price;
}