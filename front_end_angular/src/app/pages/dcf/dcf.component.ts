import { Component, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { DcfStatusResponse, AgentResult } from '../../models/ai.model';

@Component({
  selector: 'app-dcf',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './dcf.component.html',
  styleUrl: './dcf.component.scss'
})
export class DcfComponent implements OnDestroy, AfterViewInit {
  @ViewChild('companyInput') companyInput!: ElementRef<HTMLInputElement>;
  companyName = '';
  jobId: string | null = null;
  status: DcfStatusResponse | null = null;
  isRunning = false;
  pollInterval: any = null;
  expandedAgents: Set<number> = new Set();

  agentNames = [
    'Company Existence Validation',
    'DCF Input Data Collection',
    'DCF Calculation',
    'Validation & Realism Audit'
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.companyInput?.nativeElement?.focus(), 100);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startDcf(): void {
    if (!this.companyName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: this.ts.t('dcf.company_name') + ' is required' });
      return;
    }

    this.isRunning = true;
    this.status = null;
    this.jobId = null;
    this.expandedAgents.clear();

    // Get settings first
    this.api.getCurrentSettings().subscribe({
      next: (settings) => {
        this.api.startDcf({
          company_name: this.companyName,
          api_key: settings.key,
          prompts: {
            agent1: settings.promptAgent1,
            agent2: settings.promptAgent2,
            agent3: settings.promptAgent3,
            agent4: settings.promptAgent4
          }
        }).subscribe({
          next: (res) => {
            if (res.error) {
              this.isRunning = false;
              this.messageService.add({ severity: 'error', summary: this.ts.t('dcf.error'), detail: res.error });
              return;
            }
            this.jobId = res.job_id;
            this.startPolling();
          },
          error: (err) => {
            this.isRunning = false;
            const msg = err?.error?.error || 'Failed to start DCF analysis';
            this.messageService.add({ severity: 'error', summary: this.ts.t('dcf.error'), detail: msg });
          }
        });
      },
      error: () => {
        this.isRunning = false;
        this.messageService.add({ severity: 'error', summary: this.ts.t('dcf.error'), detail: 'Failed to load settings' });
      }
    });
  }

  startPolling(): void {
    this.pollInterval = setInterval(() => {
      if (!this.jobId) return;
      this.api.getDcfStatus(this.jobId).subscribe({
        next: (status) => {
          this.status = status;
          if (status.status === 'complete' || status.status === 'error' || status.status === 'cancelled' || status.cancelled) {
            this.isRunning = false;
            this.stopPolling();
            if (status.status === 'error') {
              this.messageService.add({ severity: 'error', summary: this.ts.t('dcf.error'), detail: status.error || 'Unknown error' });
            } else if (status.status === 'cancelled' || status.cancelled) {
              this.messageService.add({ severity: 'info', summary: this.ts.t('dcf.stopped'), detail: this.ts.t('dcf.stopped_detail') });
            }
          }
        },
        error: () => {
          this.isRunning = false;
          this.stopPolling();
        }
      });
    }, 3000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  stopDcf(): void {
    if (!this.jobId) {
      this.isRunning = false;
      this.stopPolling();
      return;
    }
    this.api.cancelDcf(this.jobId).subscribe({
      next: (status) => {
        this.status = status;
        this.isRunning = false;
        this.stopPolling();
        this.messageService.add({ severity: 'info', summary: this.ts.t('dcf.stopped'), detail: this.ts.t('dcf.stopped_detail') });
      },
      error: () => {
        this.isRunning = false;
        this.stopPolling();
      }
    });
  }

  downloadReport(): void {
    if (!this.jobId) return;
    const url = this.api.getDcfDownloadUrl(this.jobId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Log the download to KPI — build a short summary (max ~50 words)
    const agent1 = this.status?.agent_results?.find(r => r.agent === 1)?.result || '';
    const agent4 = this.status?.agent_results?.find(r => r.agent === 4)?.result || '';

    // Extract key facts from agent1 for a brief description
    const lines = agent1.split('\n').filter(l => l.trim().length > 0);
    const snippet = lines.slice(0, 3).join(' ').replace(/[#*|_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const words = snippet.split(' ').slice(0, 45).join(' ');
    const description = words + (snippet.split(' ').length > 45 ? '...' : '');

    const validationStatus = agent4.toLowerCase().includes('rejected')
      ? 'Rejected'
      : agent4.toLowerCase().includes('adjusted')
        ? 'Adjusted & Validated'
        : 'Validated';

    this.api.createDcfLog({
      username: this.auth.user?.username || 'unknown',
      companyName: this.companyName,
      description: description,
      validationStatus: validationStatus
    }).subscribe();
  }

  toggleAgent(agentNum: number): void {
    if (this.expandedAgents.has(agentNum)) {
      this.expandedAgents.delete(agentNum);
    } else {
      this.expandedAgents.add(agentNum);
    }
  }

  isExpanded(agentNum: number): boolean {
    return this.expandedAgents.has(agentNum);
  }

  getAgentStatus(agentNum: number): string {
    if (!this.status) return 'pending';
    const result = this.status.agent_results.find(r => r.agent === agentNum);
    if (result) return 'complete';
    if (this.status.current_agent === agentNum) return 'running';
    if (this.status.status === 'error' && this.status.current_agent === agentNum) return 'error';
    return 'pending';
  }

  getAgentResult(agentNum: number): AgentResult | undefined {
    return this.status?.agent_results.find(r => r.agent === agentNum);
  }
}
