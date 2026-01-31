import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class StaffGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // ✅ DEMO MODE:
    // Después: acá vas a chequear staff_users/{uid} con Firestore + Auth.

    const DEMO_ALLOW = true;

    if (DEMO_ALLOW) return true;

    this.router.navigate(['/signin'], { replaceUrl: true });
    return false;
  }
}
