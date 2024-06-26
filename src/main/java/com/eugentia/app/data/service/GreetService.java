package com.eugentia.app.data.service;

import com.vaadin.flow.i18n.I18NProvider;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.Locale;

/**
 * Simple service demonstrating that we can use the translations in non-UI
 * classes as well.
 */
@Service
public class GreetService implements Serializable {

    private final I18NProvider i18NProvider;

    public GreetService(I18NProvider i18NProvider) {
        this.i18NProvider = i18NProvider;
    }

    public String greet(String name, Locale locale) {
        if (name.isEmpty()) {
            return i18NProvider.getTranslation("service.anonymousGreeting", locale);
        } else {
            return i18NProvider.getTranslation("service.greeting", locale, name);
        }
    }
}