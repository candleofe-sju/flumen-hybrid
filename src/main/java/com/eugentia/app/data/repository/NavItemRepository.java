package com.eugentia.app.data.repository;

import com.eugentia.app.data.entity.NavItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NavItemRepository extends JpaRepository<NavItem, Long>, JpaSpecificationExecutor<NavItem> {
}
