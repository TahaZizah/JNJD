package com.jnjd.registration.dto;

import com.jnjd.registration.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class RegistrationResponse {
    private UUID id;
    private String teamName;
    private boolean isOfficial;
    private RegistrationStatus status;
    private String description;
    private OffsetDateTime createdAt;
}
