package com.eugentia.app.data.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "messageLocales")
public class MessageLocale {
    @Id
    @Column(unique = true)
    private String locale;

    @OneToMany(mappedBy = "locale")
    private Set<MessageContent> messageContents = new HashSet<>();
}