package com.dayflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ChangeEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "Email format is invalid")
    private String newEmail;

    @NotBlank(message = "Current password is required")
    private String password;

    public ChangeEmailRequest() {}

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
