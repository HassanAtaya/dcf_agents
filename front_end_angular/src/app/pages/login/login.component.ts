import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;

  username = '';
  password = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService,
    public ts: TranslateService
  ) {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dcf']);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.usernameInput?.nativeElement?.focus(), 100);
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: this.ts.t('login.validation') });
      return;
    }
    this.loading = true;
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dcf']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
