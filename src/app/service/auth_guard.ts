import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth_service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const ok = await this.authService.isAuthenticated();
    if (!ok) {
      this.router.navigate(['/sign-in'], { replaceUrl: true });
      return false;
    }
    return true;
  }
}
