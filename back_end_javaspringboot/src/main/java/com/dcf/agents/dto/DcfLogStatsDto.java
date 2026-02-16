package com.dcf.agents.dto;

public class DcfLogStatsDto {
    private long totalAnalyses;
    private long validatedCount;
    private long uniqueCompanies;

    public DcfLogStatsDto() {}

    public DcfLogStatsDto(long totalAnalyses, long validatedCount, long uniqueCompanies) {
        this.totalAnalyses = totalAnalyses;
        this.validatedCount = validatedCount;
        this.uniqueCompanies = uniqueCompanies;
    }

    public long getTotalAnalyses() { return totalAnalyses; }
    public void setTotalAnalyses(long totalAnalyses) { this.totalAnalyses = totalAnalyses; }
    public long getValidatedCount() { return validatedCount; }
    public void setValidatedCount(long validatedCount) { this.validatedCount = validatedCount; }
    public long getUniqueCompanies() { return uniqueCompanies; }
    public void setUniqueCompanies(long uniqueCompanies) { this.uniqueCompanies = uniqueCompanies; }
}
