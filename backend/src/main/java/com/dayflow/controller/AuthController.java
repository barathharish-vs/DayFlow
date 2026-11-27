package com.dayflow.controller;

import com.dayflow.dto.*;
import com.dayflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String tokenOrMsg = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Password reset instructions have been generated.",
                "resetToken", tokenOrMsg
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset. You can now log in."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping(value = "/profile-photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) throws java.io.IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded image cannot be empty");
        }
        return ResponseEntity.ok(authService.uploadProfilePhoto(
                userDetails.getUsername(),
                file.getBytes(),
                file.getContentType(),
                file.getOriginalFilename()
        ));
    }

    @GetMapping("/profile-photo")
    public ResponseEntity<byte[]> getProfilePhoto(@AuthenticationPrincipal UserDetails userDetails) {
        com.dayflow.entity.User user = authService.getProfilePhotoOwner(userDetails.getUsername());
        if (user.getProfilePhotoData() == null || user.getProfilePhotoData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = user.getProfilePhotoContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(user.getProfilePhotoData());
    }

    @DeleteMapping("/profile-photo")
    public ResponseEntity<UserProfileDto> deleteProfilePhoto(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.removeProfilePhoto(userDetails.getUsername()));
    }

    @PostMapping("/change-email")
    public ResponseEntity<AuthResponse> changeEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangeEmailRequest request
    ) {
        return ResponseEntity.ok(authService.changeEmail(userDetails.getUsername(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload
    ) {
        String password = payload.get("password");
        authService.deleteAccount(userDetails.getUsername(), password);
        return ResponseEntity.ok(Map.of("message", "Account successfully deleted"));
    }
}
