package com.eugentia.app.data.repository;

import com.eugentia.app.data.entity.MessageLocale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageLocaleRepository extends JpaRepository<MessageLocale, String>, JpaSpecificationExecutor<MessageLocale> {
	@Query("select s.locale from MessageLocale s")
	List<String> getMessageLocales();

	MessageLocale getMessageLocaleByLocale(String locale);
}
