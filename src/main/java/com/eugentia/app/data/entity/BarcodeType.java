package com.eugentia.app.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BarcodeType extends AbstractEntity {
	@Column(unique = true)
	private String type;
}
