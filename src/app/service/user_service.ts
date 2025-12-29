import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { AuthService } from './auth_service';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser: User | null = null;

  currentUserData: any = null;
  currentUserData$ = new BehaviorSubject<any>(null);

  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = cred.user;

      const token = await cred.user.getIdToken();
      localStorage.setItem('token', token);

      const uid = cred.user.uid;
      const userData = await this.fetchUserData(uid);
      userData.uid = uid;

      this.currentUserData = userData;
      this.currentUserData$.next(userData);

      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.currentUserData = null;
    this.currentUserData$.next(null);
    await this.authService.logout();
  }

  async fetchUserData(uid: string): Promise<any> {
    return await firstValueFrom(this.http.get(`${this.baseUrl}/api/v1/users/getByID/${uid}`));
  }
}
