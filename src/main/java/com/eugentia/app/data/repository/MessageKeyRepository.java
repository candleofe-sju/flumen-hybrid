package com.eugentia.app.data.repository;

import com.eugentia.app.data.entity.MessageKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageKeyRepository extends JpaRepository<MessageKey, String>, JpaSpecificationExecutor<MessageKey> {
	MessageKey getMessageKeyByKey(String key);
}
