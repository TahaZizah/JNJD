package com.jnjd.registration.controller;

import com.jnjd.registration.dto.RegistrationRequest;
import com.jnjd.registration.dto.RegistrationResponse;
import com.jnjd.registration.service.RateLimitService;
import com.jnjd.registration.service.RegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
@Slf4j
public class RegistrationController {

    private final RegistrationService registrationService;
    private final RateLimitService rateLimitService;

    @PostMapping
    public ResponseEntity<RegistrationResponse> createRegistration(
        @Valid @RequestBody RegistrationRequest request,
        HttpServletRequest httpRequest
    ) {
        String clientIp = getClientIp(httpRequest);
        rateLimitService.checkRateLimit(clientIp);

        log.info("Registration request from IP: {}", clientIp);
        RegistrationResponse response = registrationService.createRegistration(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
