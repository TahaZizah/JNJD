package com.jnjd.registration.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    record ErrorResponse(String field, String message) {}
    record ErrorEnvelope(int status, String error, Object details, OffsetDateTime timestamp) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorEnvelope> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> new ErrorResponse(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest().body(
            new ErrorEnvelope(400, "Validation failed", errors, OffsetDateTime.now())
        );
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorEnvelope> handleCustomValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(
            new ErrorEnvelope(400, "Validation failed",
                List.of(new ErrorResponse(ex.getField(), ex.getMessage())),
                OffsetDateTime.now())
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorEnvelope> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorEnvelope(404, "Not found", ex.getMessage(), OffsetDateTime.now())
        );
    }

    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<ErrorEnvelope> handleRateLimit(RateLimitException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
            new ErrorEnvelope(429, "Too many requests", ex.getMessage(), OffsetDateTime.now())
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorEnvelope> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            new ErrorEnvelope(401, "Unauthorized", ex.getMessage(), OffsetDateTime.now())
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorEnvelope> handleForbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            new ErrorEnvelope(403, "Forbidden", ex.getMessage(), OffsetDateTime.now())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorEnvelope> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new ErrorEnvelope(500, "Internal server error", "An unexpected error occurred.", OffsetDateTime.now())
        );
    }
}
