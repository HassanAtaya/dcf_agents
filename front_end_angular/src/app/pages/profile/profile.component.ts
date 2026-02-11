import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { TranslateService, Lang } from '../../services/translate.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DropdownModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('firstnameInput') firstnameInput!: ElementRef<HTMLInputElement>;

  firstname = '';
  lastname = '';
  password = '';
  language: Lang = 'en';
  loading = false;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    { label: 'العربية', value: 'ar' }
  ];

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.firstnameInput?.nativeElement?.focus(), 100);
  }

  ngOnInit(): void {
    const user = this.auth.user;
    if (user) {
      this.firstname = user.firstname || '';
      this.lastname = user.lastname || '';
      this.language = (user.language as Lang) || 'en';
    }
  }

  save(): void {
    this.loading = true;
    const data: any = {
      firstname: this.firstname,
      lastname: this.lastname,
      language: this.language
    };
    if (this.password) data.password = this.password;

    this.api.updateProfile(data).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.auth.updateStoredUser({
          firstname: res.firstname,
          lastname: res.lastname,
          language: res.language
        });
        this.ts.setLanguage(this.language);
        this.password = '';
        this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('profile.success') });
      },
      error: () => { this.loading = false; }
    });
  }
}
