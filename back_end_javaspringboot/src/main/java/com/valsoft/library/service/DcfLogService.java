package com.valsoft.library.service;

import com.valsoft.library.entity.DcfLog;
import com.valsoft.library.repository.DcfLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DcfLogService {

    @Autowired
    private DcfLogRepository dcfLogRepository;

    public List<DcfLog> getAll() {
        return dcfLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public DcfLog create(DcfLog log) {
        return dcfLogRepository.save(log);
    }
}
