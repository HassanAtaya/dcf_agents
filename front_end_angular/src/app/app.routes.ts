import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'permissions',
    loadComponent: () => import('./pages/permissions/permissions.component').then(m => m.PermissionsComponent),
    canActivate: [permissionGuard('add_permission', 'edit_permission', 'delete_permission')]
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent),
    canActivate: [permissionGuard('add_role', 'edit_role', 'delete_role')]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [permissionGuard('add_user', 'edit_user', 'delete_user')]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [permissionGuard('edit_settings')]
  },
  {
    path: 'dcf',
    loadComponent: () => import('./pages/dcf/dcf.component').then(m => m.DcfComponent),
    canActivate: [permissionGuard('use_dcf')]
  },
  {
    path: 'kpi',
    loadComponent: () => import('./pages/kpi/kpi.component').then(m => m.KpiComponent),
    canActivate: [permissionGuard('view_kpi')]
  },
  { path: '**', redirectTo: 'login' }
];
