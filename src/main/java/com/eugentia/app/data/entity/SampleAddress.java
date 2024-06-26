package com.eugentia.app.data.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SampleAddress extends AbstractEntity {
	private String street;
	private String postalCode;
	private String city;
	private String state;
	private String country;
}