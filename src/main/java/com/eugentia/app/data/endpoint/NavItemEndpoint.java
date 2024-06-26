package com.eugentia.app.data.endpoint;

import com.eugentia.app.data.entity.NavItem;
import com.eugentia.app.data.service.NavItemService;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;

import java.util.List;

@Endpoint
@AnonymousAllowed
public class NavItemEndpoint {

    private final NavItemService service;

    public NavItemEndpoint(NavItemService service) {
        this.service = service;
    }

    public List<NavItem> getAll() {
        return service.getAll();
    }
}
