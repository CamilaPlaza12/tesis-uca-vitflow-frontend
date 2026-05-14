// src/app/services/auth_service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from './firebaseconfig';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | null = null;
  private inactivityTimeout: any;
  private readonly INACTIVITY_TIME = 120 * 60 * 1000;
  private boundResetTimer: any;

  constructor(private router: Router) {

    this.boundResetTimer = this.resetInactivityTimer.bind(this);

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;

      if (user) {
        this.startInactivityDetection();
      } else {
        this.stopInactivityDetection();
      }
    });
  }

  private startInactivityDetection(): void {

    this.stopInactivityDetection();

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    events.forEach(event => {
      document.addEventListener(event, this.boundResetTimer, true);
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {

    if (!this.currentUser) return;

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    this.inactivityTimeout = setTimeout(() => {
      this.handleInactivityLogout();
    }, this.INACTIVITY_TIME);
  }

  private handleInactivityLogout(): void {

    if (!this.currentUser) return;

    alert('Tu sesión se cerró por inactividad.');
    this.logout();
  }

  private stopInactivityDetection(): void {

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    events.forEach(event => {
      document.removeEventListener(event, this.boundResetTimer, true);
    });
  }

  async logout(): Promise<void> {
    try {
      this.stopInactivityDetection();
      await auth.signOut();
    } finally {
      this.currentUser = null;
      this.router.navigate([''], { replaceUrl: true });
    }
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(auth, user => resolve(!!user));
    });
  }
}
