package com.eugentia.app.data.repository;

import com.eugentia.app.data.entity.MessageContent;
import com.eugentia.app.data.entity.MessageKey;
import com.eugentia.app.data.entity.MessageLocale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageContentRepository extends JpaRepository<MessageContent, Integer>, JpaSpecificationExecutor<MessageContent> {
	@Query("select s.content from MessageContent s where s.locale = :locale and s.key = :key")
	String getMessageContent(MessageLocale locale, MessageKey key);
}
