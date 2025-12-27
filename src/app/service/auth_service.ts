import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseconfig';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: User | null = null;

  constructor(private router: Router) {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => resolve(!!user));
    });
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    const u = auth.currentUser;
    if (!u) return null;
    return await u.getIdToken(forceRefresh);
  }

  async logout(): Promise<void> {
    try {
      await auth.signOut();
    } finally {
      this.currentUser = null;
      localStorage.removeItem('token');
      this.router.navigate(['/sign-in'], { replaceUrl: true });
    }
  }
}
