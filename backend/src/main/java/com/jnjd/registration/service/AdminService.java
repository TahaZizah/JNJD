package com.jnjd.registration.service;

import com.jnjd.registration.dto.AdminLoginRequest;
import com.jnjd.registration.dto.AdminLoginResponse;
import com.jnjd.registration.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public AdminLoginResponse authenticate(AdminLoginRequest request) {
        if (!adminUsername.equals(request.getUsername())) {
            log.warn("Failed admin login attempt for username: {}", request.getUsername());
            throw new BadCredentialsException("Invalid credentials");
        }
        // Support both plain text and BCrypt hashed passwords
        boolean passwordValid = adminPassword.startsWith("$2") ?
            passwordEncoder.matches(request.getPassword(), adminPassword) :
            adminPassword.equals(request.getPassword());

        if (!passwordValid) {
            log.warn("Failed admin login attempt: wrong password for {}", request.getUsername());
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(adminUsername);
        log.info("Admin login successful: {}", adminUsername);

        return AdminLoginResponse.builder()
            .token(token)
            .username(adminUsername)
            .expiresInMs(expirationMs)
            .build();
    }
}
