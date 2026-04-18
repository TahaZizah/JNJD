package com.jnjd.registration.entity;

import com.jnjd.registration.enums.MemberRole;
import com.jnjd.registration.enums.TshirtSize;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private MemberRole role;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "tshirt_size", nullable = false)
    private TshirtSize tshirtSize;

    @Column(name = "tshirt_size_custom", length = 50)
    private String tshirtSizeCustom;

    @Column(name = "school_name", length = 255)
    private String schoolName;

    @Column(name = "proof_file_key", length = 512)
    private String proofFileKey;
}
