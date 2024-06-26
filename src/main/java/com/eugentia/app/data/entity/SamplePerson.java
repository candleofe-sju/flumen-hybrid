package com.eugentia.app.data.entity;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class SamplePerson extends AbstractEntity {

    private String firstName;

    private String lastName;

    @Email
    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    private String occupation;

    private String role;

    private boolean important;
}
