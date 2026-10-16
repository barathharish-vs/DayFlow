package com.dayflow.controller;

import com.dayflow.dto.UpdateSettingsRequest;
import com.dayflow.dto.UserProfileDto;
import com.dayflow.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getSettings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(settingsService.getSettings(userDetails.getUsername()));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateSettingsRequest request
    ) {
        return ResponseEntity.ok(settingsService.updateSettings(userDetails.getUsername(), request));
    }
}
