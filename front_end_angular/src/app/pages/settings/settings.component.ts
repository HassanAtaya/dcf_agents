import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { AiSettings } from '../../models/ai.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputTextareaModule, ButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settings: AiSettings | null = null;
  apiKey = '';
  promptAgent1 = '';
  promptAgent2 = '';
  promptAgent3 = '';
  promptAgent4 = '';
  loading = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.api.getSettings().subscribe(data => {
      if (data && data.length > 0) {
        this.settings = data[0];
        this.apiKey = this.settings.key || '';
        this.promptAgent1 = this.settings.promptAgent1 || '';
        this.promptAgent2 = this.settings.promptAgent2 || '';
        this.promptAgent3 = this.settings.promptAgent3 || '';
        this.promptAgent4 = this.settings.promptAgent4 || '';
      }
    });
  }

  save(): void {
    if (!this.settings) return;
    this.loading = true;
    this.api.updateSettings(this.settings.id, {
      key: this.apiKey,
      promptAgent1: this.promptAgent1,
      promptAgent2: this.promptAgent2,
      promptAgent3: this.promptAgent3,
      promptAgent4: this.promptAgent4
    }).subscribe({
      next: () => {
        this.loading = false;
        this.loadSettings();
        this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('settings.saved') });
      },
      error: () => { this.loading = false; }
    });
  }

  maskKey(key: string): string {
    if (!key || key === 'NO_KEY') return 'NO_KEY';
    return key.substring(0, 6) + '*'.repeat(Math.min(key.length - 6, 20));
  }
}
