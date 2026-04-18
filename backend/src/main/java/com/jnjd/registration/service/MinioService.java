package com.jnjd.registration.service;

import com.jnjd.registration.dto.PresignResponse;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class MinioService {

    private final MinioClient minioClient;
    private final MinioClient publicMinioClient;

    public MinioService(MinioClient minioClient, @Qualifier("publicMinioClient") MinioClient publicMinioClient) {
        this.minioClient = minioClient;
        this.publicMinioClient = publicMinioClient;
    }

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.presign-expiry-minutes}")
    private int presignExpiryMinutes;

    public PresignResponse generatePresignedPutUrl(String originalFilename, String contentType) {
        String ext = getExtension(originalFilename);
        String objectKey = "proofs/" + UUID.randomUUID() + "/" + originalFilename;

        try {
            String url = publicMinioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(bucket)
                    .object(objectKey)
                    .expiry(presignExpiryMinutes, TimeUnit.MINUTES)
                    .build()
            );

            log.debug("Generated presigned PUT URL for key: {}", objectKey);
            return PresignResponse.builder()
                .uploadUrl(url)
                .objectKey(objectKey)
                .expiresInSeconds((long) presignExpiryMinutes * 60)
                .build();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate upload URL", e);
        }
    }

    public String generatePresignedGetUrl(String objectKey) {
        try {
            return publicMinioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectKey)
                    .expiry(presignExpiryMinutes, TimeUnit.MINUTES)
                    .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned GET URL for {}: {}", objectKey, e.getMessage(), e);
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }
}
