package com.eugentia.app.data.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "nav_item")
public class NavItem extends AbstractEntity {
    @NotNull
    private Long parentIdx;

    private String icon;

    private String title;

    private String path;
}
