import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '../../../services/translate.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router, public ts: TranslateService) {}

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
