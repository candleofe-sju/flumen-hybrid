package com.eugentia.app.provider;

import com.eugentia.app.data.entity.MessageKey;
import com.eugentia.app.data.entity.MessageLocale;
import com.eugentia.app.data.repository.MessageContentRepository;
import com.eugentia.app.data.repository.MessageKeyRepository;
import com.eugentia.app.data.repository.MessageLocaleRepository;
import com.vaadin.flow.i18n.I18NProvider;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.util.*;

/**
 * Simple implementation of {@link I18NProvider}.
 * <p>
 * Actual translations can be found in the labelsbundle_{lang_code}.properties
 * files.
 * <p>
 * Singleton scope.
 */
@Component
public class SimpleI18NProvider implements I18NProvider {

    @Autowired
    private MessageContentRepository messageContentRepository;

    @Autowired
    private MessageKeyRepository messageKeyRepository;

    @Autowired
    private MessageLocaleRepository messageLocaleRepository;

    @PostConstruct
    private void initMap() {
        /*
         * Use no-country versions, so that e.g. both en_US and en_GB work.
         */
        List<Locale> providedLocales = getProvidedLocales();

        // Read the translation file for each locale
        Map<String, ResourceBundle> localeMap = new HashMap<>();
        for (final Locale locale : providedLocales) {

            final ResourceBundle resourceBundle = ResourceBundle.getBundle("labelsbundle", locale);
            localeMap.put(locale.getLanguage(), resourceBundle);
        }
    }

    @Override
    public List<Locale> getProvidedLocales() {
        List<String> messageLocales = messageLocaleRepository.getMessageLocales();
        List<Locale> locales = new ArrayList<>();
        for (String messageLocale : messageLocales) {
            locales.add(new Locale.Builder().setLanguage(messageLocale).build());
        }
        return Collections.unmodifiableList(locales);
    }

    @Override
    public String getTranslation(String key, Locale locale, Object... params) {
        try {
            MessageLocale messageLocale = messageLocaleRepository.getMessageLocaleByLocale(locale.getLanguage());
            MessageKey messageKey = messageKeyRepository.getMessageKeyByKey(key);
            String rawstring = messageContentRepository.getMessageContent(messageLocale, messageKey);

            return MessageFormat.format(rawstring, params);

        } catch (final MissingResourceException e) {
            // Translation isn't found, return error message instead of null as per API
            System.out.printf("No translation found for key {%s}%n", key);
            return String.format("!{%s}", key);
        } catch (final IllegalArgumentException e) {
            e.printStackTrace(); // for devs to find where this happened
            // Incorrect parameters
            return null;
        }
    }
}
