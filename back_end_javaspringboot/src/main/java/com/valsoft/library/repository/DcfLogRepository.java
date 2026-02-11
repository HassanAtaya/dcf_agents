package com.valsoft.library.repository;

import com.valsoft.library.entity.DcfLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DcfLogRepository extends JpaRepository<DcfLog, Long> {
    List<DcfLog> findAllByOrderByCreatedAtDesc();
}
