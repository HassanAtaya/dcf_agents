export interface DcfLog {
  id: number;
  createdAt: string;
  username: string;
  companyName: string;
  description: string;
  validationStatus: string;
}

export interface DcfLogStats {
  totalAnalyses: number;
  validatedCount: number;
  uniqueCompanies: number;
}
