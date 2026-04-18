package com.jnjd.registration.repository;

import com.jnjd.registration.entity.Registration;
import com.jnjd.registration.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    @Query("""
        SELECT r FROM Registration r
        WHERE (:status IS NULL OR r.status = :status)
        AND (:isOfficial IS NULL OR r.isOfficial = :isOfficial)
        ORDER BY r.createdAt DESC
    """)
    Page<Registration> findAllWithFilters(
        @Param("status") RegistrationStatus status,
        @Param("isOfficial") Boolean isOfficial,
        Pageable pageable
    );

    /** Eagerly fetch members in a single query — use before passing to async email service. */
    @Query("SELECT r FROM Registration r LEFT JOIN FETCH r.members WHERE r.id = :id")
    Optional<Registration> findByIdWithMembers(@Param("id") UUID id);
}
