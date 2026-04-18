package com.jnjd.registration.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class RegistrationRequest {

    @NotBlank(message = "Team name is required")
    @Size(min = 2, max = 100, message = "Team name must be between 2 and 100 characters")
    private String teamName;

    private boolean isOfficial;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Members list is required")
    @Size(min = 3, max = 3, message = "Exactly 3 members are required")
    @Valid
    private List<MemberRequest> members;
}
