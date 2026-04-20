package com.jnjd.registration.service;

import com.jnjd.registration.dto.MemberRequest;
import com.jnjd.registration.dto.RegistrationRequest;
import com.jnjd.registration.dto.RegistrationResponse;
import com.jnjd.registration.entity.Registration;
import com.jnjd.registration.enums.RegistrationStatus;
import com.jnjd.registration.exception.ValidationException;
import com.jnjd.registration.repository.RegistrationRepository;
import com.jnjd.registration.repository.RegistrationStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private RegistrationStatusHistoryRepository historyRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private RegistrationService registrationService;

    private RegistrationRequest validRequest;

    @BeforeEach
    void setUp() {
        MemberRequest m1 = new MemberRequest();
        m1.setFullName("Captain Name");
        m1.setEmail("captain@test.com");
        m1.setPhone("1234567890");

        MemberRequest m2 = new MemberRequest();
        m2.setFullName("Second Name");
        m2.setEmail("second@test.com");
        m2.setPhone("1234567890");

        MemberRequest m3 = new MemberRequest();
        m3.setFullName("Third Name");
        m3.setEmail("third@test.com");
        m3.setPhone("1234567890");

        validRequest = new RegistrationRequest();
        validRequest.setTeamName("Test Team");
        validRequest.setOfficial(false);
        validRequest.setDescription("Test Desc");
        validRequest.setMembers(Arrays.asList(m1, m2, m3));
    }

    @Test
    void createRegistration_Success() {
        Registration mockSaved = new Registration();
        mockSaved.setId(UUID.randomUUID());
        mockSaved.setTeamName("Test Team");
        mockSaved.setOfficial(false);
        mockSaved.setStatus(RegistrationStatus.PENDING);
        mockSaved.setDescription("Test Desc");
        mockSaved.setCreatedAt(OffsetDateTime.now());

        when(registrationRepository.saveAndFlush(any(Registration.class))).thenReturn(mockSaved);

        RegistrationResponse response = registrationService.createRegistration(validRequest);

        assertNotNull(response);
        assertEquals("Test Team", response.getTeamName());
        assertEquals(RegistrationStatus.PENDING, response.getStatus());
        verify(registrationRepository, times(1)).saveAndFlush(any(Registration.class));
    }

    @Test
    void createRegistration_ThrowsValidationException_WhenNotThreeMembers() {
        validRequest.setMembers(List.of(validRequest.getMembers().get(0)));

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            registrationService.createRegistration(validRequest);
        });

        assertEquals("members", exception.getField());
        assertEquals("Exactly 3 members are required", exception.getMessage());
        verify(registrationRepository, never()).saveAndFlush(any());
    }

    @Test
    void createRegistration_ThrowsValidationException_WhenOfficialAndNoSchool() {
        validRequest.setOfficial(true);
        // Members don't have school set in setUp()

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            registrationService.createRegistration(validRequest);
        });

        assertEquals("members[0].schoolName", exception.getField());
        verify(registrationRepository, never()).saveAndFlush(any());
    }
}
