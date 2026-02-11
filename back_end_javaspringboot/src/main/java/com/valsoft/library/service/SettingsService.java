package com.valsoft.library.service;

import com.valsoft.library.entity.AiSettings;
import com.valsoft.library.repository.AiSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SettingsService {

    @Autowired
    private AiSettingsRepository aiSettingsRepository;

    public List<AiSettings> getAllSettings() {
        return aiSettingsRepository.findAll();
    }

    public AiSettings getSettings() {
        List<AiSettings> all = aiSettingsRepository.findAll();
        if (all.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No AI settings configured");
        }
        return all.get(0);
    }

    public AiSettings updateSettings(Long id, AiSettings data) {
        AiSettings settings = aiSettingsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Settings not found"));
        if (data.getKey() != null) settings.setKey(data.getKey());
        if (data.getPromptAgent1() != null) settings.setPromptAgent1(data.getPromptAgent1());
        if (data.getPromptAgent2() != null) settings.setPromptAgent2(data.getPromptAgent2());
        if (data.getPromptAgent3() != null) settings.setPromptAgent3(data.getPromptAgent3());
        if (data.getPromptAgent4() != null) settings.setPromptAgent4(data.getPromptAgent4());
        return aiSettingsRepository.save(settings);
    }
}
