package com.docpet.animalhospital.config;

import com.docpet.animalhospital.domain.Authority;
import com.docpet.animalhospital.repository.AuthorityRepository;
import com.docpet.animalhospital.security.AuthoritiesConstants;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Chạy khi ứng dụng khởi động:
 * 1. Tạo các quyền ROLE_* nếu bảng jhi_authority còn thiếu (ví dụ database mới chưa chạy sql.sql).
 *    Nếu thiếu, việc đăng ký vẫn thành công nhưng tài khoản không có quyền nào.
 * 2. Gán lại quyền cho các tài khoản đã bị tạo thiếu quyền, dựa vào bảng owner / vet / assistant.
 */
@Component
public class AuthorityInitializer implements ApplicationRunner {

    private static final Logger LOG = LoggerFactory.getLogger(AuthorityInitializer.class);

    private static final List<String> DEFAULT_AUTHORITIES = List.of(
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.USER,
        AuthoritiesConstants.DOCTOR,
        AuthoritiesConstants.ASSISTANT
    );

    // Bảng hồ sơ -> quyền tương ứng. Tên bảng là hằng số nội bộ, không lấy từ input.
    private static final List<String[]> PROFILE_TABLE_AUTHORITIES = List.of(
        new String[] { "owner", AuthoritiesConstants.USER },
        new String[] { "vet", AuthoritiesConstants.DOCTOR },
        new String[] { "assistant", AuthoritiesConstants.ASSISTANT }
    );

    private final AuthorityRepository authorityRepository;
    private final JdbcTemplate jdbcTemplate;

    public AuthorityInitializer(AuthorityRepository authorityRepository, JdbcTemplate jdbcTemplate) {
        this.authorityRepository = authorityRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAuthorities();
        backfillMissingAuthorities();
    }

    private void seedAuthorities() {
        for (String name : DEFAULT_AUTHORITIES) {
            if (!authorityRepository.existsById(name)) {
                authorityRepository.save(new Authority().name(name));
                LOG.info("Đã tạo quyền còn thiếu: {}", name);
            }
        }
    }

    private void backfillMissingAuthorities() {
        for (String[] mapping : PROFILE_TABLE_AUTHORITIES) {
            String table = mapping[0];
            String authority = mapping[1];
            int added = jdbcTemplate.update(
                "INSERT INTO jhi_user_authority (user_id, authority_name) " +
                "SELECT p.user_id, ? FROM " + table + " p " +
                "WHERE p.user_id IS NOT NULL " +
                "AND NOT EXISTS (SELECT 1 FROM jhi_user_authority ua " +
                "WHERE ua.user_id = p.user_id AND ua.authority_name = ?)",
                authority,
                authority
            );
            if (added > 0) {
                LOG.info("Đã gán lại quyền {} cho {} tài khoản", authority, added);
            }
        }
    }
}
