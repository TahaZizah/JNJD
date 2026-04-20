package com.jnjd.registration.dto;

import com.jnjd.registration.enums.TshirtSize;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MemberRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^0[67][0-9]{8}$", message = "Phone must be a valid Moroccan number (e.g. 0612345678)")
    private String phone;

    @NotNull(message = "T-shirt size is required")
    private TshirtSize tshirtSize;

    @Size(max = 50, message = "Custom t-shirt size must not exceed 50 characters")
    private String tshirtSizeCustom;

    // Required for official teams
    @Size(max = 255, message = "School name must not exceed 255 characters")
    private String schoolName;

    private String proofFileKey;

    // Optional: CV for recruiter visibility at event stands
    private String cvFileKey;
}
