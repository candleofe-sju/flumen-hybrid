package com.eugentia.app.data.service;

import com.eugentia.app.data.entity.Item;
import com.eugentia.app.data.repository.ItemRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.crud.CrudRepositoryService;

@BrowserCallable
@AnonymousAllowed
public class ItemService extends CrudRepositoryService<Item, Long, ItemRepository> {
    
}
