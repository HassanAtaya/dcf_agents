import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../services/api.service';
import { TranslateService } from '../../services/translate.service';
import { DcfLog } from '../../models/dcf-log.model';

const CHART_SAMPLE_SIZE = 500;

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [CommonModule, TableModule, ChartModule, CardModule, ButtonModule, DialogModule, TooltipModule],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KpiComponent implements OnInit {
  private contentSignal = signal<DcfLog[]>([]);
  private totalRecordsSignal = signal(0);
  private loadingSignal = signal(false);
  private statsSignal = signal<{ totalAnalyses: number; validatedCount: number; uniqueCompanies: number }>({
    totalAnalyses: 0,
    validatedCount: 0,
    uniqueCompanies: 0
  });
  private chartDataSignal = signal<DcfLog[]>([]);

  logs = this.contentSignal.asReadonly();
  totalRecords = this.totalRecordsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  stats = this.statsSignal.asReadonly();
  chartData = this.chartDataSignal.asReadonly();

  totalAnalyses = computed(() => this.stats().totalAnalyses);
  validatedCount = computed(() => this.stats().validatedCount);
  uniqueCompanies = computed(() => this.stats().uniqueCompanies);

  statusChartData = signal<Record<string, unknown>>({});
  statusChartOptions = signal<Record<string, unknown>>({});
  monthlyChartData = signal<Record<string, unknown>>({});
  monthlyChartOptions = signal<Record<string, unknown>>({});
  companyChartData = signal<Record<string, unknown>>({});
  companyChartOptions = signal<Record<string, unknown>>({});

  selectedLog = signal<DcfLog | null>(null);
  showDescDialog = false;

  constructor(public ts: TranslateService, private api: ApiService) {}

  viewDescription(log: DcfLog): void {
    this.selectedLog.set(log);
    this.showDescDialog = true;
  }

  ngOnInit(): void {
    this.api.getDcfLogsStats().subscribe({
      next: (s) => {
        this.statsSignal.set({
          totalAnalyses: s.totalAnalyses,
          validatedCount: s.validatedCount,
          uniqueCompanies: s.uniqueCompanies
        });
        this.totalRecordsSignal.set(s.totalAnalyses);
      }
    });
    this.api.getDcfLogs({ page: 0, size: CHART_SAMPLE_SIZE, sort: 'createdAt,desc' }).subscribe({
      next: (p) => {
        this.chartDataSignal.set(p.content);
        this.buildCharts();
      }
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.loadingSignal.set(true);
    const page = event.first ?? 0;
    const size = event.rows ?? 20;
    const sort = event.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`
      : 'createdAt,desc';
    this.api.getDcfLogs({ page: Math.floor(page / size), size, sort }).subscribe({
      next: (p) => {
        this.contentSignal.set(p.content);
        this.totalRecordsSignal.set(p.totalElements);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false)
    });
  }

  private buildCharts(): void {
    const data = this.chartDataSignal();
    if (data.length === 0) return;
    const statusMap: Record<string, number> = {};
    data.forEach(l => {
      const s = l.validationStatus || 'Unknown';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    this.statusChartData.set({
      labels: Object.keys(statusMap),
      datasets: [{
        data: Object.values(statusMap),
        backgroundColor: ['#48bb78', '#667eea', '#ed8936', '#e53e3e', '#a0aec0']
      }]
    });
    this.statusChartOptions.set({ plugins: { legend: { position: 'bottom' } }, cutout: '60%' });

    const monthMap: Record<string, number> = {};
    data.forEach(l => {
      if (!l.createdAt) return;
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const sortedMonths = Object.keys(monthMap).sort();
    this.monthlyChartData.set({
      labels: sortedMonths,
      datasets: [{
        label: this.ts.t('kpi.analyses'),
        data: sortedMonths.map(m => monthMap[m]),
        backgroundColor: '#667eea'
      }]
    });
    this.monthlyChartOptions.set({
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    });

    const compMap: Record<string, number> = {};
    data.forEach(l => { compMap[l.companyName] = (compMap[l.companyName] || 0) + 1; });
    const topCompanies = Object.entries(compMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.companyChartData.set({
      labels: topCompanies.map(c => c[0]),
      datasets: [{
        data: topCompanies.map(c => c[1]),
        backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea', '#38b2ac']
      }]
    });
    this.companyChartOptions.set({ plugins: { legend: { position: 'bottom' } }, cutout: '60%' });
  }
}
