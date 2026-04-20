package com.jnjd.registration.dto;

import com.jnjd.registration.enums.MemberRole;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.enums.TshirtSize;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RegistrationDetailResponse {
    private UUID id;
    private String teamName;
    private boolean isOfficial;
    private RegistrationStatus status;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<MemberDetail> members;
    private List<StatusHistoryEntry> statusHistory;

    @Data
    @Builder
    public static class MemberDetail {
        private UUID id;
        private MemberRole role;
        private String fullName;
        private String email;
        private String phone;
        private TshirtSize tshirtSize;
        private String tshirtSizeCustom;
        private String schoolName;
        private String proofFileKey;
        private String cvFileKey;
    }

    @Data
    @Builder
    public static class StatusHistoryEntry {
        private RegistrationStatus oldStatus;
        private RegistrationStatus newStatus;
        private String changedBy;
        private OffsetDateTime timestamp;
    }
}
