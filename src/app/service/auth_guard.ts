// src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../service/firebaseconfig';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const publicRoutes = new Set([
      '',
      'login',
      'register',
      'forgot-password',
      'hospital-onboarding', // wizard
      'backoffice' // 🔥 dejamos backoffice público por ahora
    ]);

    const path = route.routeConfig?.path ?? '';

    if (publicRoutes.has(path)) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      const unsub = onAuthStateChanged(auth, user => {
        unsub();
        if (user) {
          resolve(true);
        } else {
          this.router.navigate(['/'], { replaceUrl: true });
          resolve(false);
        }
      });
    });
  }
}
