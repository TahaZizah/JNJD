package com.jnjd.registration.service;

import com.jnjd.registration.dto.MemberRequest;
import com.jnjd.registration.dto.RegistrationRequest;
import com.jnjd.registration.dto.RegistrationResponse;
import com.jnjd.registration.entity.Registration;
import com.jnjd.registration.enums.MemberRole;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.enums.TshirtSize;
import com.jnjd.registration.exception.ValidationException;
import com.jnjd.registration.repository.RegistrationRepository;
import com.jnjd.registration.repository.RegistrationStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * RegistrationService unit tests (expanded from existing baseline).
 *
 * Covers:
 *   - createRegistration happy paths (official + unofficial)
 *   - Business-rule validation (DP / VAL scenarios)
 *   - Member role assignment order (CAPTAIN → SECOND → THIRD)
 *   - Email trimming and lowercase normalization
 *   - tshirtSize OTHER requires custom size
 *   - Official team: schoolName + proofFileKey required for every member
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RegistrationService — unit tests")
class RegistrationServiceExtendedTest {

    @Mock RegistrationRepository                registrationRepository;
    @Mock RegistrationStatusHistoryRepository   historyRepository;
    @Mock EmailService                          emailService;

    @InjectMocks RegistrationService registrationService;

    // ─── Fixture helpers ───────────────────────────────────────────────────────

    private MemberRequest member(String name, String email, String phone, TshirtSize size) {
        MemberRequest m = new MemberRequest();
        m.setFullName(name);
        m.setEmail(email);
        m.setPhone(phone);
        m.setTshirtSize(size);
        return m;
    }

    private MemberRequest officialMember(int idx) {
        MemberRequest m = member("Member " + idx, "m" + idx + "@test.com", "061234567" + idx, TshirtSize.M);
        m.setSchoolName("School " + idx);
        m.setProofFileKey("proofs/uuid-" + idx + "/proof.pdf");
        return m;
    }

    private RegistrationRequest buildRequest(boolean official, MemberRequest... members) {
        RegistrationRequest req = new RegistrationRequest();
        req.setTeamName("Test Team");
        req.setOfficial(official);
        req.setDescription("desc");
        req.setMembers(Arrays.asList(members));
        return req;
    }

    /** Mocks saveAndFlush to return what it was given with an ID attached. */
    private void mockSave() {
        when(registrationRepository.saveAndFlush(any(Registration.class)))
            .thenAnswer(inv -> {
                Registration r = inv.getArgument(0);
                r.setId(UUID.randomUUID());
                r.setCreatedAt(OffsetDateTime.now());
                return r;
            });
    }

    // ─── Happy Paths ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Happy Paths")
    class HappyPaths {

        @Test
        @DisplayName("Unofficial team: saved with PENDING status")
        void unofficialTeam_savedPending() {
            mockSave();
            MemberRequest[] ms = { member("Cap","cap@t.com","0612345678",TshirtSize.M),
                                   member("Sec","sec@t.com","0698765432",TshirtSize.L),
                                   member("Trd","trd@t.com","0711223344",TshirtSize.S) };

            RegistrationResponse res = registrationService.createRegistration(buildRequest(false, ms));

            assertThat(res.getStatus()).isEqualTo(RegistrationStatus.PENDING);
            assertThat(res.getTeamName()).isEqualTo("Test Team");
            assertThat(res.getId()).isNotNull();
            verify(registrationRepository, times(1)).saveAndFlush(any());
        }

        @Test
        @DisplayName("Official team: saved when all proof keys provided")
        void officialTeam_savedWithProofKeys() {
            mockSave();
            RegistrationRequest req = buildRequest(true, officialMember(0), officialMember(1), officialMember(2));

            RegistrationResponse res = registrationService.createRegistration(req);

            assertThat(res.isOfficial()).isTrue();
            assertThat(res.getStatus()).isEqualTo(RegistrationStatus.PENDING);
        }

        @Test
        @DisplayName("Member roles assigned in order: CAPTAIN, SECOND, THIRD")
        void memberRoles_assignedInOrder() {
            mockSave();
            RegistrationRequest req = buildRequest(false,
                member("A","a@t.com","0612345670",TshirtSize.M),
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));

            registrationService.createRegistration(req);

            ArgumentCaptor<Registration> captor = ArgumentCaptor.forClass(Registration.class);
            verify(registrationRepository).saveAndFlush(captor.capture());

            List<com.jnjd.registration.entity.Member> savedMembers = captor.getValue().getMembers();
            assertThat(savedMembers.get(0).getRole()).isEqualTo(MemberRole.CAPTAIN);
            assertThat(savedMembers.get(1).getRole()).isEqualTo(MemberRole.SECOND);
            assertThat(savedMembers.get(2).getRole()).isEqualTo(MemberRole.THIRD);
        }

        @Test
        @DisplayName("Email normalized to lowercase and trimmed")
        void email_normalizedToLowercase() {
            mockSave();
            MemberRequest m0 = member("Cap","  CAPTAIN@EXAMPLE.COM  ","0612345678",TshirtSize.M);
            RegistrationRequest req = buildRequest(false,
                m0,
                member("Sec","sec@t.com","0698765432",TshirtSize.L),
                member("Trd","trd@t.com","0711223344",TshirtSize.S));

            registrationService.createRegistration(req);

            ArgumentCaptor<Registration> captor = ArgumentCaptor.forClass(Registration.class);
            verify(registrationRepository).saveAndFlush(captor.capture());
            assertThat(captor.getValue().getMembers().get(0).getEmail())
                .isEqualTo("captain@example.com");
        }

        @Test
        @DisplayName("Team name trimmed of surrounding whitespace")
        void teamName_trimmed() {
            mockSave();
            RegistrationRequest req = buildRequest(false,
                member("A","a@t.com","0612345670",TshirtSize.M),
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));
            req.setTeamName("  Alpha Team  ");

            registrationService.createRegistration(req);

            ArgumentCaptor<Registration> captor = ArgumentCaptor.forClass(Registration.class);
            verify(registrationRepository).saveAndFlush(captor.capture());
            assertThat(captor.getValue().getTeamName()).isEqualTo("Alpha Team");
        }

        @Test
        @DisplayName("tshirtSize OTHER with custom value accepted")
        void otherTshirtSize_withCustom_accepted() {
            mockSave();
            MemberRequest m = member("X","x@t.com","0612345670",TshirtSize.OTHER);
            m.setTshirtSizeCustom("3XL");
            RegistrationRequest req = buildRequest(false,
                m,
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));

            assertDoesNotThrow(() -> registrationService.createRegistration(req));
        }
    }

    // ─── Business-Rule Validation Failures ─────────────────────────────────────

    @Nested
    @DisplayName("Validation Failures")
    class ValidationFailures {

        @Test
        @DisplayName("VAL-01: null members list → ValidationException on 'members'")
        void nullMembers_throws() {
            RegistrationRequest req = buildRequest(false);
            req.setMembers(null);

            ValidationException ex = assertThrows(ValidationException.class,
                () -> registrationService.createRegistration(req));
            assertThat(ex.getField()).isEqualTo("members");
        }

        @Test
        @DisplayName("VAL-02: Only 1 member → ValidationException")
        void oneMembers_throws() {
            RegistrationRequest req = buildRequest(false, member("X","x@t.com","0612345670",TshirtSize.M));

            ValidationException ex = assertThrows(ValidationException.class,
                () -> registrationService.createRegistration(req));
            assertThat(ex.getField()).isEqualTo("members");
            assertThat(ex.getMessage()).containsIgnoringCase("3");
        }

        @Test
        @DisplayName("VAL-03: Official member missing schoolName → ValidationException")
        void officialMissingSchool_throws() {
            MemberRequest noSchool = officialMember(0);
            noSchool.setSchoolName(null);
            RegistrationRequest req = buildRequest(true, noSchool, officialMember(1), officialMember(2));

            ValidationException ex = assertThrows(ValidationException.class,
                () -> registrationService.createRegistration(req));
            assertThat(ex.getField()).contains("schoolName");
        }

        @Test
        @DisplayName("VAL-04: Official member blank schoolName → ValidationException")
        void officialBlankSchool_throws() {
            MemberRequest blankSchool = officialMember(0);
            blankSchool.setSchoolName("   ");
            RegistrationRequest req = buildRequest(true, blankSchool, officialMember(1), officialMember(2));

            assertThrows(ValidationException.class, () -> registrationService.createRegistration(req));
        }

        @Test
        @DisplayName("VAL-05: Official member missing proofFileKey → ValidationException")
        void officialMissingProof_throws() {
            MemberRequest noProof = officialMember(0);
            noProof.setProofFileKey(null);
            RegistrationRequest req = buildRequest(true, noProof, officialMember(1), officialMember(2));

            ValidationException ex = assertThrows(ValidationException.class,
                () -> registrationService.createRegistration(req));
            assertThat(ex.getField()).contains("proofFileKey");
        }

        @Test
        @DisplayName("VAL-06: tshirtSize OTHER without custom → ValidationException")
        void otherSizeWithoutCustom_throws() {
            MemberRequest m = member("X","x@t.com","0612345670",TshirtSize.OTHER);
            // tshirtSizeCustom is null
            RegistrationRequest req = buildRequest(false,
                m,
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));

            ValidationException ex = assertThrows(ValidationException.class,
                () -> registrationService.createRegistration(req));
            assertThat(ex.getField()).contains("tshirtSizeCustom");
        }

        @Test
        @DisplayName("VAL-07: Repository never called when validation fails")
        void repositoryNeverCalledOnValidationFailure() {
            RegistrationRequest req = buildRequest(false);
            req.setMembers(null);

            assertThrows(ValidationException.class, () -> registrationService.createRegistration(req));
            verify(registrationRepository, never()).saveAndFlush(any());
        }
    }

    // ─── DP: Data Persistence Assertions ──────────────────────────────────────

    @Nested
    @DisplayName("DP — Data Persistence")
    class DataPersistence {

        @Test
        @DisplayName("DP-01: saveAndFlush is called (not save), ensuring immediate DB flush")
        void saveAndFlush_calledNotSave() {
            mockSave();
            RegistrationRequest req = buildRequest(false,
                member("A","a@t.com","0612345670",TshirtSize.M),
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));

            registrationService.createRegistration(req);

            verify(registrationRepository, times(1)).saveAndFlush(any());
            verify(registrationRepository, never()).save(any(Registration.class));
        }

        @Test
        @DisplayName("DP-02: Returned response ID matches saved entity ID")
        void returnedId_matchesSavedEntityId() {
            UUID expectedId = UUID.fromString("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
            when(registrationRepository.saveAndFlush(any(Registration.class)))
                .thenAnswer(inv -> {
                    Registration r = inv.getArgument(0);
                    r.setId(expectedId);
                    r.setCreatedAt(OffsetDateTime.now());
                    return r;
                });

            RegistrationRequest req = buildRequest(false,
                member("A","a@t.com","0612345670",TshirtSize.M),
                member("B","b@t.com","0612345671",TshirtSize.L),
                member("C","c@t.com","0612345672",TshirtSize.S));

            RegistrationResponse res = registrationService.createRegistration(req);
            assertThat(res.getId()).isEqualTo(expectedId);
        }

        @Test
        @DisplayName("DP-03: cvFileKey and proofFileKey persisted as-is (no sanitization)")
        void fileKeys_persistedAsIs() {
            mockSave();
            String proofKey = "proofs/550e8400-e29b-41d4-a716-446655440000/proof.pdf";
            String cvKey    = "cvs/550e8400-e29b-41d4-a716-446655440001/cv.pdf";

            MemberRequest m = member("A","a@t.com","0612345670",TshirtSize.M);
            m.setSchoolName("ENSIAS");
            m.setProofFileKey(proofKey);
            m.setCvFileKey(cvKey);

            RegistrationRequest req = buildRequest(true,
                m, officialMember(1), officialMember(2));

            registrationService.createRegistration(req);

            ArgumentCaptor<Registration> captor = ArgumentCaptor.forClass(Registration.class);
            verify(registrationRepository).saveAndFlush(captor.capture());
            assertThat(captor.getValue().getMembers().get(0).getProofFileKey()).isEqualTo(proofKey);
            assertThat(captor.getValue().getMembers().get(0).getCvFileKey()).isEqualTo(cvKey);
        }
    }
}
