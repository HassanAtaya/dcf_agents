package com.dcf.agents.repository;

import com.dcf.agents.entity.DcfLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DcfLogRepository extends JpaRepository<DcfLog, Long> {
    Page<DcfLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByValidationStatusContainingIgnoreCase(String status);

    @Query("SELECT COUNT(DISTINCT d.companyName) FROM DcfLog d")
    long countDistinctCompanyName();
}
