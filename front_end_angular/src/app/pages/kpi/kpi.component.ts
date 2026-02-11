import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../services/api.service';
import { TranslateService } from '../../services/translate.service';
import { DcfLog } from '../../models/dcf-log.model';

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule, CardModule, ButtonModule, DialogModule],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KpiComponent implements OnInit {
  logs: DcfLog[] = [];
  loading = true;

  // Chart data
  statusChartData: any = {};
  statusChartOptions: any = {};
  monthlyChartData: any = {};
  monthlyChartOptions: any = {};
  companyChartData: any = {};
  companyChartOptions: any = {};

  selectedLog: DcfLog | null = null;
  showDescDialog = false;

  constructor(public ts: TranslateService, private api: ApiService) {}

  viewDescription(log: DcfLog): void {
    this.selectedLog = log;
    this.showDescDialog = true;
  }

  ngOnInit(): void {
    this.api.getDcfLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
        this.buildCharts();
      },
      error: () => { this.loading = false; }
    });
  }

  get totalAnalyses(): number { return this.logs.length; }
  get validatedCount(): number { return this.logs.filter(l => l.validationStatus?.toLowerCase().includes('validated')).length; }
  get uniqueCompanies(): number { return new Set(this.logs.map(l => l.companyName)).size; }

  private buildCharts(): void {
    // Donut: validation status breakdown
    const statusMap: Record<string, number> = {};
    this.logs.forEach(l => {
      const s = l.validationStatus || 'Unknown';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    this.statusChartData = {
      labels: Object.keys(statusMap),
      datasets: [{
        data: Object.values(statusMap),
        backgroundColor: ['#48bb78', '#667eea', '#ed8936', '#e53e3e', '#a0aec0']
      }]
    };
    this.statusChartOptions = { plugins: { legend: { position: 'bottom' } }, cutout: '60%' };

    // Bar: analyses per month
    const monthMap: Record<string, number> = {};
    this.logs.forEach(l => {
      if (!l.createdAt) return;
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const sortedMonths = Object.keys(monthMap).sort();
    this.monthlyChartData = {
      labels: sortedMonths,
      datasets: [{
        label: this.ts.t('kpi.analyses'),
        data: sortedMonths.map(m => monthMap[m]),
        backgroundColor: '#667eea'
      }]
    };
    this.monthlyChartOptions = {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    // Donut: top companies
    const compMap: Record<string, number> = {};
    this.logs.forEach(l => { compMap[l.companyName] = (compMap[l.companyName] || 0) + 1; });
    const topCompanies = Object.entries(compMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.companyChartData = {
      labels: topCompanies.map(c => c[0]),
      datasets: [{
        data: topCompanies.map(c => c[1]),
        backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea', '#38b2ac']
      }]
    };
    this.companyChartOptions = { plugins: { legend: { position: 'bottom' } }, cutout: '60%' };
  }
}
