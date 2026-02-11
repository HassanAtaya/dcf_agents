package com.valsoft.library.controller;

import com.valsoft.library.entity.AiSettings;
import com.valsoft.library.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping
    public ResponseEntity<List<AiSettings>> getAll() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/current")
    public ResponseEntity<AiSettings> getCurrent() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AiSettings> update(@PathVariable Long id, @RequestBody AiSettings data) {
        return ResponseEntity.ok(settingsService.updateSettings(id, data));
    }
}
