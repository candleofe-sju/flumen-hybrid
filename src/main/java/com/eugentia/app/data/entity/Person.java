package com.eugentia.app.data.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Setter
public class Person extends AbstractEntity {
	private String firstName, lastName;
	private LocalDate birthDate;
	private String company;
	private String address;
	private String zip;
	private String city;
	private double longitude;
	private double latitude;
}