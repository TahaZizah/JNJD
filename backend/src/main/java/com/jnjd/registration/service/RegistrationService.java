package com.jnjd.registration.service;

import com.jnjd.registration.dto.*;
import com.jnjd.registration.entity.Member;
import com.jnjd.registration.entity.Registration;
import com.jnjd.registration.entity.RegistrationStatusHistory;
import com.jnjd.registration.enums.MemberRole;
import com.jnjd.registration.enums.TshirtSize;
import com.jnjd.registration.exception.ResourceNotFoundException;
import com.jnjd.registration.exception.ValidationException;
import com.jnjd.registration.repository.RegistrationRepository;
import com.jnjd.registration.repository.RegistrationStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jnjd.registration.enums.RegistrationStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final RegistrationStatusHistoryRepository historyRepository;
    private final EmailService emailService;

    private static final MemberRole[] ROLES = {MemberRole.CAPTAIN, MemberRole.SECOND, MemberRole.THIRD};

    @Transactional
    public RegistrationResponse createRegistration(RegistrationRequest request) {
        validateRegistrationRequest(request);

        Registration registration = Registration.builder()
            .teamName(request.getTeamName().trim())
            .isOfficial(request.isOfficial())
            .description(request.getDescription())
            .status(RegistrationStatus.PENDING)
            .build();

        List<Member> members = new ArrayList<>();
        for (int i = 0; i < request.getMembers().size(); i++) {
            MemberRequest mr = request.getMembers().get(i);
            Member member = Member.builder()
                .registration(registration)
                .role(ROLES[i])
                .fullName(mr.getFullName().trim())
                .email(mr.getEmail().trim().toLowerCase())
                .phone(mr.getPhone().trim())
                .tshirtSize(mr.getTshirtSize())
                .tshirtSizeCustom(mr.getTshirtSizeCustom())
                .schoolName(mr.getSchoolName())
                .proofFileKey(mr.getProofFileKey())
                .cvFileKey(mr.getCvFileKey())
                .build();
            members.add(member);
        }
        registration.setMembers(members);

        Registration saved = registrationRepository.saveAndFlush(registration);
        log.info("Registration created: id={}, team={}, official={}", saved.getId(), saved.getTeamName(), saved.isOfficial());

        return RegistrationResponse.builder()
            .id(saved.getId())
            .teamName(saved.getTeamName())
            .isOfficial(saved.isOfficial())
            .status(saved.getStatus())
            .description(saved.getDescription())
            .createdAt(saved.getCreatedAt())
            .build();
    }

    private void validateRegistrationRequest(RegistrationRequest request) {
        List<MemberRequest> members = request.getMembers();
        if (members == null || members.size() != 3) {
            throw new ValidationException("members", "Exactly 3 members are required");
        }

        if (request.isOfficial()) {
            for (int i = 0; i < members.size(); i++) {
                MemberRequest m = members.get(i);
                if (m.getSchoolName() == null || m.getSchoolName().isBlank()) {
                    throw new ValidationException("members[" + i + "].schoolName",
                        "School name is required for official team members");
                }
                if (m.getProofFileKey() == null || m.getProofFileKey().isBlank()) {
                    throw new ValidationException("members[" + i + "].proofFileKey",
                        "Proof file is required for official team members");
                }
            }
        }

        for (int i = 0; i < members.size(); i++) {
            MemberRequest m = members.get(i);
            if (TshirtSize.OTHER.equals(m.getTshirtSize()) &&
                (m.getTshirtSizeCustom() == null || m.getTshirtSizeCustom().isBlank())) {
                throw new ValidationException("members[" + i + "].tshirtSizeCustom",
                    "Custom t-shirt size is required when size is OTHER");
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<RegistrationResponse> listRegistrations(RegistrationStatus status, Boolean isOfficial,
                                                         int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return registrationRepository.findAllWithFilters(status, isOfficial, pageable)
            .map(r -> RegistrationResponse.builder()
                .id(r.getId())
                .teamName(r.getTeamName())
                .isOfficial(r.isOfficial())
                .status(r.getStatus())
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public RegistrationDetailResponse getRegistrationDetail(UUID id) {
        Registration reg = registrationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + id));

        List<RegistrationDetailResponse.MemberDetail> memberDetails = reg.getMembers().stream()
            .map(m -> RegistrationDetailResponse.MemberDetail.builder()
                .id(m.getId())
                .role(m.getRole())
                .fullName(m.getFullName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .tshirtSize(m.getTshirtSize())
                .tshirtSizeCustom(m.getTshirtSizeCustom())
                .schoolName(m.getSchoolName())
                .proofFileKey(m.getProofFileKey())
                .cvFileKey(m.getCvFileKey())
                .build())
            .toList();

        List<RegistrationDetailResponse.StatusHistoryEntry> history =
            historyRepository.findByRegistrationIdOrderByTimestampAsc(id).stream()
                .map(h -> RegistrationDetailResponse.StatusHistoryEntry.builder()
                    .oldStatus(h.getOldStatus())
                    .newStatus(h.getNewStatus())
                    .changedBy(h.getChangedBy())
                    .timestamp(h.getTimestamp())
                    .build())
                .toList();

        return RegistrationDetailResponse.builder()
            .id(reg.getId())
            .teamName(reg.getTeamName())
            .isOfficial(reg.isOfficial())
            .status(reg.getStatus())
            .description(reg.getDescription())
            .createdAt(reg.getCreatedAt())
            .updatedAt(reg.getUpdatedAt())
            .members(memberDetails)
            .statusHistory(history)
            .build();
    }

    @Transactional
    public RegistrationDetailResponse updateStatus(UUID id, RegistrationStatus newStatus, String changedBy) {
        Registration reg = registrationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + id));

        RegistrationStatus oldStatus = reg.getStatus();
        reg.setStatus(newStatus);
        registrationRepository.save(reg);

        RegistrationStatusHistory historyEntry = RegistrationStatusHistory.builder()
            .registrationId(id)
            .oldStatus(oldStatus)
            .newStatus(newStatus)
            .changedBy(changedBy)
            .build();
        historyRepository.save(historyEntry);

        log.info("Status updated: id={}, {} -> {} by {}", id, oldStatus, newStatus, changedBy);

        // Trigger async email if approved — must load members eagerly before the
        // transaction closes, as the @Async thread cannot access a closed Hibernate session.
        if (newStatus == RegistrationStatus.APPROVED) {
            Registration regWithMembers = registrationRepository.findByIdWithMembers(id)
                .orElse(reg); // fallback to reg if not found (shouldn't happen)
            emailService.sendApprovalEmails(regWithMembers);
        }

        return getRegistrationDetail(id);
    }
}
