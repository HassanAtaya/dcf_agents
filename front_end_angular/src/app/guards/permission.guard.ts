import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function permissionGuard(...requiredPermissions: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn) return router.parseUrl('/login');
    if (auth.isAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    if (auth.hasAnyPermission(requiredPermissions)) return true;
    return router.parseUrl('/login');
  };
}
