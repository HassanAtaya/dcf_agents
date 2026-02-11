import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, ToastModule, ConfirmDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    public router: Router,
    public loader: LoaderService
  ) {}

  get showLayout(): boolean {
    return this.auth.isLoggedIn && !this.router.url.startsWith('/login');
  }
}
