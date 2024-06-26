package com.eugentia.app.listeners;

import com.vaadin.flow.server.VaadinSession;
import jakarta.servlet.annotation.WebListener;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;

import java.util.Enumeration;

@WebListener
public class SessionExpireListener implements HttpSessionListener {

    @Override
    public void sessionCreated(HttpSessionEvent hse) {
        System.out.println("Session created");
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent hse) {
        System.out.println("Session destroyed");
        Enumeration<String> e = hse.getSession().getAttributeNames();

        while (e.hasMoreElements()) {
            Object o = hse.getSession().getAttribute(e.nextElement());
            if (o instanceof VaadinSession vs) {
            }
        }
    }
}