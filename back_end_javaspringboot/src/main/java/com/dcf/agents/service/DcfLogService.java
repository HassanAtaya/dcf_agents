package com.dcf.agents.service;

import com.dcf.agents.dto.DcfLogStatsDto;
import com.dcf.agents.entity.DcfLog;
import com.dcf.agents.repository.DcfLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class DcfLogService {

    @Autowired
    private DcfLogRepository dcfLogRepository;

    public Page<DcfLog> getAll(Pageable pageable) {
        return dcfLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public DcfLogStatsDto getStats() {
        long total = dcfLogRepository.count();
        long validated = dcfLogRepository.countByValidationStatusContainingIgnoreCase("Validated");
        long uniqueCompanies = dcfLogRepository.countDistinctCompanyName();
        return new DcfLogStatsDto(total, validated, uniqueCompanies);
    }

    public DcfLog create(DcfLog log) {
        return dcfLogRepository.save(log);
    }
}
