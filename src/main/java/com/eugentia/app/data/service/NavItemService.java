package com.eugentia.app.data.service;

import com.eugentia.app.data.entity.NavItem;
import com.eugentia.app.data.entity.User;
import com.eugentia.app.data.repository.NavItemRepository;
import com.eugentia.app.data.repository.UserRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@BrowserCallable
@AnonymousAllowed
public class NavItemService {

    private final NavItemRepository repository;

    public NavItemService(NavItemRepository repository) {
        this.repository = repository;
    }

    public Optional<NavItem> get(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<NavItem> getAll() {
        return repository.findAll();
    }

    public int count() {
        return (int) repository.count();
    }

}
