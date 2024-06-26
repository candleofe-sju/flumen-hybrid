package com.eugentia.app.data.repository;

import com.eugentia.app.data.entity.BarcodeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BarcodeTypeRepository extends JpaRepository<BarcodeType, Long>, JpaSpecificationExecutor<BarcodeType> {
	BarcodeType findBarcodeTypeByType(String type);
}