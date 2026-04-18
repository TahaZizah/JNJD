package com.jnjd.registration.controller;

import com.jnjd.registration.dto.*;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.service.AdminService;
import com.jnjd.registration.service.MinioService;
import com.jnjd.registration.service.RegistrationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final RegistrationService registrationService;
    private final MinioService minioService;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    // ── Auth ──────────────────────────────────────────────────────────────────

    @PostMapping("/auth/login")
    public ResponseEntity<AdminLoginResponse> login(
        @RequestBody AdminLoginRequest request,
        HttpServletResponse response
    ) {
        AdminLoginResponse loginResponse = adminService.authenticate(request);

        // Set httpOnly cookie
        Cookie cookie = new Cookie("admin_token", loginResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtExpirationMs / 1000));
        response.addCookie(cookie);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("admin_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    // ── Registrations ─────────────────────────────────────────────────────────

    @GetMapping("/registrations")
    public ResponseEntity<Page<RegistrationResponse>> listRegistrations(
        @RequestParam(required = false) RegistrationStatus status,
        @RequestParam(required = false) Boolean isOfficial,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
            registrationService.listRegistrations(status, isOfficial, page, size)
        );
    }

    @GetMapping("/registrations/{id}")
    public ResponseEntity<RegistrationDetailResponse> getRegistration(@PathVariable UUID id) {
        return ResponseEntity.ok(registrationService.getRegistrationDetail(id));
    }

    @PatchMapping("/registrations/{id}/status")
    public ResponseEntity<RegistrationDetailResponse> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody StatusUpdateRequest request,
        @AuthenticationPrincipal String adminUsername
    ) {
        return ResponseEntity.ok(
            registrationService.updateStatus(id, request.getStatus(), adminUsername)
        );
    }

    @GetMapping("/registrations/{id}/proof-url")
    public ResponseEntity<Map<String, String>> getProofUrl(
        @PathVariable UUID id,
        @RequestParam String objectKey
    ) {
        String url = minioService.generatePresignedGetUrl(objectKey);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
