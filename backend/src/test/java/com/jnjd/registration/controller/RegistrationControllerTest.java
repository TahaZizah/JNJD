package com.jnjd.registration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnjd.registration.dto.MemberRequest;
import com.jnjd.registration.dto.RegistrationRequest;
import com.jnjd.registration.dto.RegistrationResponse;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.enums.TshirtSize;
import com.jnjd.registration.security.JwtService;
import com.jnjd.registration.service.RateLimitService;
import com.jnjd.registration.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Registration Controller Unit Tests (REG / VAL scenarios)
 *
 * Scope: Validates HTTP layer behaviour — request mapping, validation errors,
 *        status codes — without touching the database.
 * Strategy: MockMvc + Mockito mocks for RegistrationService and RateLimitService.
 */
@WebMvcTest(RegistrationController.class)
@DisplayName("RegistrationController — HTTP layer tests")
class RegistrationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean RegistrationService registrationService;
    @MockBean RateLimitService     rateLimitService;
    @MockBean JwtService           jwtService;  // Required by JwtAuthenticationFilter in the security filter chain

    // ─── Fixtures ──────────────────────────────────────────────────────────────

    private static MemberRequest validMember(String role, int idx) {
        MemberRequest m = new MemberRequest();
        m.setFullName(role + " Member " + idx);
        m.setEmail(role.toLowerCase() + idx + "@test.local");
        m.setPhone("061234567" + idx);
        m.setTshirtSize(TshirtSize.M);
        return m;
    }

    private RegistrationRequest unofficialRequest() {
        RegistrationRequest req = new RegistrationRequest();
        req.setTeamName("Test Team Alpha");
        req.setOfficial(false);
        req.setDescription("Integration test team");
        req.setMembers(List.of(validMember("Cap", 0), validMember("Sec", 1), validMember("Trd", 2)));
        return req;
    }

    private RegistrationResponse mockResponse(String teamName) {
        return RegistrationResponse.builder()
                .id(UUID.randomUUID())
                .teamName(teamName)
                .isOfficial(false)
                .status(RegistrationStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @BeforeEach
    void permitAllRateLimit() {
        // Default: rate limit never throws — override per-test when testing rate limiting
        doNothing().when(rateLimitService).checkRateLimit(any());
    }

    // ─── Happy Path ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("REG — Happy Path")
    class HappyPath {

        @Test
        @DisplayName("REG-01: POST /registrations returns 201 with PENDING status")
        @WithMockUser
        void createRegistration_returns201() throws Exception {
            RegistrationRequest req = unofficialRequest();
            when(registrationService.createRegistration(any())).thenReturn(mockResponse("Test Team Alpha"));

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.teamName").value("Test Team Alpha"))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.id").isNotEmpty());

            verify(registrationService, times(1)).createRegistration(any());
        }

        @Test
        @DisplayName("REG-02: Service is called exactly once per request (no double-save)")
        @WithMockUser
        void createRegistration_callsServiceExactlyOnce() throws Exception {
            when(registrationService.createRegistration(any())).thenReturn(mockResponse("Team"));

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(unofficialRequest())))
                    .andExpect(status().isCreated());

            verify(registrationService, times(1)).createRegistration(any());
        }
    }

    // ─── Bean Validation Failures ───────────────────────────────────────────────

    @Nested
    @DisplayName("VAL — Bean Validation")
    class ValidationTests {

        @Test
        @DisplayName("VAL-01: Missing teamName → 400")
        @WithMockUser
        void missingTeamName_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.setTeamName(null);

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details[0].field").value("teamName"));

            verify(registrationService, never()).createRegistration(any());
        }

        @Test
        @DisplayName("VAL-02: Blank teamName → 400")
        @WithMockUser
        void blankTeamName_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.setTeamName("  ");

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VAL-03: teamName exceeds 100 chars → 400")
        @WithMockUser
        void teamNameTooLong_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.setTeamName("A".repeat(101));

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VAL-04: Members list is null → 400")
        @WithMockUser
        void nullMembersList_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.setMembers(null);

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VAL-05: Only 2 members → 400")
        @WithMockUser
        void twoMembers_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.setMembers(List.of(validMember("Cap", 0), validMember("Sec", 1)));

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VAL-06: Invalid email in member → 400")
        @WithMockUser
        void invalidEmail_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.getMembers().get(0).setEmail("not-an-email");

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details[?(@.field == 'members[0].email')]").exists());
        }

        @Test
        @DisplayName("VAL-07: Non-Moroccan phone → 400")
        @WithMockUser
        void nonMoroccanPhone_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.getMembers().get(0).setPhone("1234567890"); // Missing 0[67] prefix

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details[?(@.field == 'members[0].phone')]").exists());
        }

        @Test
        @DisplayName("VAL-08: Null tshirtSize → 400")
        @WithMockUser
        void nullTshirtSize_returns400() throws Exception {
            RegistrationRequest req = unofficialRequest();
            req.getMembers().get(0).setTshirtSize(null);

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ─── Rate Limiting ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("SEC — Rate Limiting")
    class RateLimitTests {

        @Test
        @DisplayName("SEC-01: Exceeded rate limit → 429")
        @WithMockUser
        void rateLimitExceeded_returns429() throws Exception {
            doThrow(new com.jnjd.registration.exception.RateLimitException(
                    "Too many registration attempts. Please try again in 10 minutes."
            )).when(rateLimitService).checkRateLimit(any());

            mockMvc.perform(post("/api/v1/registrations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(unofficialRequest())))
                    .andExpect(status().isTooManyRequests());

            verify(registrationService, never()).createRegistration(any());
        }
    }
}
