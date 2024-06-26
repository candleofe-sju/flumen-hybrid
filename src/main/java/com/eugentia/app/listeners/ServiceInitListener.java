package com.eugentia.app.listeners;

import com.eugentia.app.errorhandlers.CustomErrorHandler;
import com.vaadin.flow.component.PushConfiguration;
import com.vaadin.flow.component.ReconnectDialogConfiguration;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.page.LoadingIndicatorConfiguration;
import com.vaadin.flow.i18n.I18NProvider;
import com.vaadin.flow.server.*;
import com.vaadin.flow.shared.communication.PushMode;
import com.vaadin.flow.spring.annotation.SpringComponent;
import jakarta.servlet.http.Cookie;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

@SpringComponent
public class ServiceInitListener implements VaadinServiceInitListener {

    private final I18NProvider i18nProvider;

    public ServiceInitListener(I18NProvider i18nProvider) {
        this.i18nProvider = i18nProvider;
    }

    @Override
    public void serviceInit(ServiceInitEvent event) {
        var service = getVaadinService(event);

        service.setSystemMessagesProvider(info -> {
            CustomizedSystemMessages messages = new CustomizedSystemMessages();
            messages.setSessionExpiredCaption("Session expired");
            messages.setSessionExpiredMessage("Take note of any unsaved data, and click here or press ESC key to continue.");
            messages.setSessionExpiredURL("session-expired.html");
            messages.setSessionExpiredNotificationEnabled(true);
            return messages;
        });

        event.addIndexHtmlRequestListener(response -> {
            // IndexHtmlRequestListener to change the bootstrap page
        });

        event.addDependencyFilter((dependencies, filterContext) -> {
            // DependencyFilter to add/remove/change dependencies sent to
            // the client
            return dependencies;
        });

        event.addRequestHandler((session, request, response) -> {
            // RequestHandler to change how responses are handled
            return false;
        });
    }

    private void initLanguage(UI ui) {

        Optional<Cookie> localeCookie = Optional.empty();

        Cookie[] cookies = VaadinService.getCurrentRequest().getCookies();
        if (cookies != null) {
            localeCookie = Arrays.stream(cookies).filter(cookie -> "locale".equals(cookie.getName())).findFirst();
        }

        Locale locale;

        if (localeCookie.isPresent() && !"".equals(localeCookie.get().getValue())) {
            // Cookie found, use that
            locale = Locale.forLanguageTag(localeCookie.get().getValue());
        } else {
            // Try to use Vaadin's browser locale detection
            locale = VaadinService.getCurrentRequest().getLocale();
        }

        // If the detection fails, default to the first language we support.
        if (locale.getLanguage().isEmpty()) {
            locale = i18nProvider.getProvidedLocales().getFirst();
        }

        ui.setLocale(locale);
    }

    private VaadinService getVaadinService(ServiceInitEvent event) {
        var service = event.getSource();

        service.addSessionInitListener(
                initEvent -> {
                    LoggerFactory.getLogger(getClass()).info("A new Session has been initialized!");
                    VaadinSession.getCurrent().setErrorHandler(new CustomErrorHandler());
                });

        service.addSessionDestroyListener(
                initEvent -> LoggerFactory.getLogger(getClass()).info("A Session has been destroyed!"));

        service.addUIInitListener(
                initEvent -> {
                    LoggerFactory.getLogger(getClass()).info("A new UI has been initialized!");
                    var ui = initEvent.getUI();
                    LoadingIndicatorConfiguration indicator = ui.getLoadingIndicatorConfiguration();
                    indicator.setApplyDefaultTheme(false);
                    indicator.setSecondDelay(700000);

                    PushConfiguration push = ui.getPushConfiguration();
                    push.setPushMode(PushMode.AUTOMATIC);

                    ReconnectDialogConfiguration dialog = ui.getReconnectDialogConfiguration();
                    dialog.setDialogText("reconnecting...");
                });

        service.addUIInitListener(uiInitEvent -> {
            // Whenever a new user arrives, determine locale
            initLanguage(uiInitEvent.getUI());
        });

        return service;
    }
}