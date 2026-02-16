package com.dcf.agents.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_settings")
public class AiSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "`key`")
    private String key;

    @Column(name = "prompt_agent1", columnDefinition = "TEXT")
    private String promptAgent1;

    @Column(name = "prompt_agent2", columnDefinition = "TEXT")
    private String promptAgent2;

    @Column(name = "prompt_agent3", columnDefinition = "TEXT")
    private String promptAgent3;

    @Column(name = "prompt_agent4", columnDefinition = "TEXT")
    private String promptAgent4;

    public AiSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getPromptAgent1() { return promptAgent1; }
    public void setPromptAgent1(String promptAgent1) { this.promptAgent1 = promptAgent1; }

    public String getPromptAgent2() { return promptAgent2; }
    public void setPromptAgent2(String promptAgent2) { this.promptAgent2 = promptAgent2; }

    public String getPromptAgent3() { return promptAgent3; }
    public void setPromptAgent3(String promptAgent3) { this.promptAgent3 = promptAgent3; }

    public String getPromptAgent4() { return promptAgent4; }
    public void setPromptAgent4(String promptAgent4) { this.promptAgent4 = promptAgent4; }
}
