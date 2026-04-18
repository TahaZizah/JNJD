package com.jnjd.registration.repository;

import com.jnjd.registration.entity.RegistrationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegistrationStatusHistoryRepository extends JpaRepository<RegistrationStatusHistory, UUID> {
    List<RegistrationStatusHistory> findByRegistrationIdOrderByTimestampAsc(UUID registrationId);
}
