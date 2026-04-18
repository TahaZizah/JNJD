package com.jnjd.registration.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PresignResponse {
    private String uploadUrl;
    private String objectKey;
    private long expiresInSeconds;
}
