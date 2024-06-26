package com.eugentia.app.data.service;

import com.eugentia.app.data.entity.Label;
import com.eugentia.app.data.repository.LabelRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.crud.CrudRepositoryService;

import java.util.List;

@BrowserCallable
@AnonymousAllowed
public class LabelService extends CrudRepositoryService<Label, Long, LabelRepository> {
    
    public List<Label> getLabels() {
        return super.getRepository().findAll();
    }
}
