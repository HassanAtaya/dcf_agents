package com.valsoft.library.controller;

import com.valsoft.library.entity.DcfLog;
import com.valsoft.library.service.DcfLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dcf-logs")
public class DcfLogController {

    @Autowired
    private DcfLogService dcfLogService;

    @GetMapping
    public ResponseEntity<List<DcfLog>> getAll() {
        return ResponseEntity.ok(dcfLogService.getAll());
    }

    @PostMapping
    public ResponseEntity<DcfLog> create(@RequestBody DcfLog log) {
        return ResponseEntity.ok(dcfLogService.create(log));
    }
}
