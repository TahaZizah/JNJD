package com.jnjd.registration.config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Bean
    @Primary
    public MinioClient minioClient() {
        log.info("Configuring MinIO client for internal endpoint: {}", endpoint);
        return MinioClient.builder()
            .endpoint(endpoint)
            .credentials(accessKey, secretKey)
            .region("us-east-1")
            .build();
    }

    @Bean("publicMinioClient")
    public MinioClient publicMinioClient(@Value("${minio.public-endpoint}") String publicEndpoint) {
        log.info("Configuring MinIO client for public presigning: {}", publicEndpoint);
        return MinioClient.builder()
            .endpoint(publicEndpoint)
            .credentials(accessKey, secretKey)
            .region("us-east-1")
            .build();
    }
}
