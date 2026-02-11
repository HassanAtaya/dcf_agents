import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '../../../services/translate.service';

interface MenuItem {
  labelKey: string;
  icon: string;
  route: string;
  permissions: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = false;

  menuItems: MenuItem[] = [
    { labelKey: 'sidebar.permissions', icon: 'pi pi-lock', route: '/permissions', permissions: ['add_permission', 'edit_permission', 'delete_permission'] },
    { labelKey: 'sidebar.roles', icon: 'pi pi-shield', route: '/roles', permissions: ['add_role', 'edit_role', 'delete_role'] },
    { labelKey: 'sidebar.users', icon: 'pi pi-users', route: '/users', permissions: ['add_user', 'edit_user', 'delete_user'] },
    { labelKey: 'sidebar.settings', icon: 'pi pi-cog', route: '/settings', permissions: ['edit_settings'] },
    { labelKey: 'sidebar.dcf', icon: 'pi pi-chart-line', route: '/dcf', permissions: ['use_dcf'] },
    { labelKey: 'sidebar.kpi', icon: 'pi pi-chart-bar', route: '/kpi', permissions: ['view_kpi'] }
  ];

  constructor(public auth: AuthService, public ts: TranslateService) {}

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  isVisible(item: MenuItem): boolean {
    if (item.permissions.length === 0) return true;
    return this.auth.hasAnyPermission(item.permissions);
  }
}
