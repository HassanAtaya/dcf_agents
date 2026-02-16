package com.dcf.agents.controller;

import com.dcf.agents.dto.DcfLogStatsDto;
import com.dcf.agents.entity.DcfLog;
import com.dcf.agents.service.DcfLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dcf-logs")
public class DcfLogController {

    @Autowired
    private DcfLogService dcfLogService;

    @GetMapping
    public ResponseEntity<Page<DcfLog>> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(dcfLogService.getAll(pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<DcfLogStatsDto> getStats() {
        return ResponseEntity.ok(dcfLogService.getStats());
    }

    @PostMapping
    public ResponseEntity<DcfLog> create(@RequestBody DcfLog log) {
        return ResponseEntity.ok(dcfLogService.create(log));
    }
}
