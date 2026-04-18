package com.jnjd.registration.dto;

import com.jnjd.registration.enums.RegistrationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RegistrationStatus status;
}
