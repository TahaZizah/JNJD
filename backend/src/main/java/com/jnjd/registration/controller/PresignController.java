package com.jnjd.registration.controller;

import com.jnjd.registration.dto.PresignResponse;
import com.jnjd.registration.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
@Slf4j
public class PresignController {

    private final MinioService minioService;

    @Value("${app.file.allowed-extensions}")
    private List<String> allowedExtensions;

    @Value("${app.file.allowed-content-types}")
    private List<String> allowedContentTypes;

    @GetMapping("/presign")
    public ResponseEntity<PresignResponse> getPresignedUrl(
        @RequestParam String filename,
        @RequestParam String contentType
    ) {
        validateFile(filename, contentType);
        PresignResponse response = minioService.generatePresignedPutUrl(filename, contentType);
        return ResponseEntity.ok(response);
    }

    private void validateFile(String filename, String contentType) {
        String ext = getExtension(filename).toLowerCase();
        if (!allowedExtensions.contains(ext)) {
            throw new com.jnjd.registration.exception.ValidationException("filename",
                "File extension not allowed. Allowed: " + String.join(", ", allowedExtensions));
        }
        if (!allowedContentTypes.contains(contentType.toLowerCase())) {
            throw new com.jnjd.registration.exception.ValidationException("contentType",
                "Content type not allowed. Allowed: " + String.join(", ", allowedContentTypes));
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }
}
