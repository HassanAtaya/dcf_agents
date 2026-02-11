export interface AiSettings {
  id: number;
  name: string;
  key: string;
  promptAgent1: string;
  promptAgent2: string;
  promptAgent3: string;
  promptAgent4: string;
}

export interface DcfStartRequest {
  company_name: string;
  api_key: string;
  prompts: {
    agent1: string;
    agent2: string;
    agent3: string;
    agent4: string;
  };
}

export interface DcfStartResponse {
  job_id: string;
  error?: string;
}

export interface AgentResult {
  agent: number;
  name: string;
  result: string;
}

export interface DcfStatusResponse {
  status: string;
  current_agent: number;
  current_agent_name: string;
  agent_results: AgentResult[];
  error: string | null;
  download_ready: boolean;
  zip_filename: string | null;
}
