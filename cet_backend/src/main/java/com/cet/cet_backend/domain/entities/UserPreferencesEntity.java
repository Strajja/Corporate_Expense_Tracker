package com.cet.cet_backend.domain.entities;

import jakarta.persistence.*;

/**
 * Entity representing user-specific preferences, such as language settings.
 * Mapped one-to-one with the UserEntity.
 */
@Entity
@Table(name = "user_preferences")
public class UserPreferencesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "language", nullable = false, length = 2)
    private String language = "EN"; // Default language is English

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private UserEntity user;

    public UserPreferencesEntity() {
    }

    public UserPreferencesEntity(UserEntity user) {
        this.user = user;
        this.language = "EN";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }
}