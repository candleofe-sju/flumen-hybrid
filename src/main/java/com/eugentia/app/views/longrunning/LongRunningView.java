package com.eugentia.app.views.longrunning;

import com.eugentia.app.data.service.BackendService;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.accordion.Accordion;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.login.LoginForm;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@PageTitle("Long Running Jobs")
@Menu(icon = "", order = 17)
@Route(value = "long-running")
@RolesAllowed("USER")
public class LongRunningView extends VerticalLayout {
    private final ProgressBar progressBar = new ProgressBar();

    private final Button cancelButton = new Button("Cancel task execution");

    public LongRunningView(BackendService backendService) {
        addClassName("long-running");

        var form = new LoginForm();
        var accordion = new Accordion();
        accordion.add("Analytics", form);

        progressBar.setWidth("15em");
        progressBar.setIndeterminate(true);

        progressBar.setVisible(false);
        cancelButton.setVisible(false);

        Button startButton = new Button("Start long-running task", clickEvent -> {
            var ui = clickEvent.getSource().getUI().orElseThrow();
            var future = backendService.longRunningTask();

            progressBar.setVisible(true);
            cancelButton.setVisible(true);
            cancelButton.addClickListener(e -> future.cancel(true));

            future.whenCompleteAsync((successResult, error) -> {
                if (error == null) {
                    updateUi(ui, "Task finished: " + successResult);
                } else {
                    updateUi(ui, "Task failed: " + error.getMessage());
                }
            });
        });

        var isBlockedButton = new Button("Is UI blocked?", clickEvent -> Notification.show("UI isn't blocked!"));

        add(accordion, startButton, new HorizontalLayout(progressBar, cancelButton), isBlockedButton);
    }

    private void updateUi(UI ui, String result) {
        ui.access(() -> {
            Notification.show(result);
            progressBar.setVisible(false);
            cancelButton.setVisible(false);
        });
    }
}
