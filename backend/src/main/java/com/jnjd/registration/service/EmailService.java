package com.jnjd.registration.service;

import com.jnjd.registration.entity.Member;
import com.jnjd.registration.entity.Registration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromAddress;

    @Value("${app.email.payment-amount}")
    private String paymentAmount;

    @Value("${app.email.payment-contact}")
    private String paymentContact;

    @Async("taskExecutor")
    public void sendApprovalEmails(Registration registration) {
        log.info("Sending approval emails for team: {}", registration.getTeamName());
        List<Member> members = registration.getMembers();
        if (members == null || members.isEmpty()) {
            log.warn("No members found for registration {}", registration.getId());
            return;
        }
        for (Member member : members) {
            if (member.getRole() != com.jnjd.registration.enums.MemberRole.CAPTAIN) {
                continue;
            }
            try {
                sendApprovalEmail(member, registration);
                log.info("Approval email sent to captain: {}", member.getEmail());
            } catch (Exception e) {
                // Email is best-effort — approval is already persisted in DB.
                // Log and continue; don't propagate exception back to HTTP thread.
                log.error("Failed to send approval email to {} (team={}): {}",
                    member.getEmail(), registration.getTeamName(), e.getMessage());
            }
        }
    }

    private void sendApprovalEmail(Member member, Registration registration) throws MessagingException {
        Context ctx = new Context();
        ctx.setVariable("memberName", member.getFullName());
        ctx.setVariable("teamName", registration.getTeamName());
        ctx.setVariable("registrationId", registration.getId().toString());
        ctx.setVariable("paymentAmount", paymentAmount);
        ctx.setVariable("paymentContact", paymentContact);
        ctx.setVariable("role", member.getRole().name());

        String html = templateEngine.process("email/approval", ctx);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(member.getEmail());
        helper.setSubject("Your JNJD 20th Edition Registration is Approved!");
        helper.setText(html, true);

        mailSender.send(message);
        log.info("Approval email sent to: {}", member.getEmail());
    }

    @Async("taskExecutor")
    public void sendStatusChangeEmail(Registration registration, String newStatus) {
        if (!"APPROVED".equals(newStatus)) return;
        sendApprovalEmails(registration);
    }
}
