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
    // Caso normal: Firebase ya tiene el user
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(forceRefresh);
    }

    // Caso edge: Firebase todavía no resolvió la sesión
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();

        if (!user) {
          resolve(null);
        } else {
          const token = await user.getIdToken(forceRefresh);
          resolve(token);
        }
      });
    });
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
