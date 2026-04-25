package com.jnjd.registration.repository;

import com.jnjd.registration.entity.Registration;
import com.jnjd.registration.enums.RegistrationStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class RegistrationRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.liquibase.enabled", () -> "true");
    }

    @Autowired
    private RegistrationRepository registrationRepository;

    @Test
    void testSaveAndFindRegistration() {
        Registration reg = Registration.builder()
                .teamName("Testcontainers Team")
                .isOfficial(true)
                .status(RegistrationStatus.PENDING)
                .description("Testing with testcontainers")
                .build();

        Registration saved = registrationRepository.save(reg);
        
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTeamName()).isEqualTo("Testcontainers Team");

        Registration found = registrationRepository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getTeamName()).isEqualTo("Testcontainers Team");
    }
}
