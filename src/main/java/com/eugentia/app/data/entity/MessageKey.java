package com.eugentia.app.data.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "messageKeys")
public class MessageKey {
    @Id
    @Column(name = "messageKey", unique = true)
    private String key;

    @OneToMany(mappedBy = "key")
    private Set<MessageContent> messageContents = new HashSet<>();
}