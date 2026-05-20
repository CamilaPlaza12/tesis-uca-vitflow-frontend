import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { AuthService } from './auth_service';
type LoginResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class UserService {h
  currentUser: User | null = null;

  currentUserData: any = null;
  currentUserData$ = new BehaviorSubject<any>(null);
  //private baseUrl = 'http://localhost:8000';
  private baseUrl = 'https://vitflow-backend.onrender.com';

  constructor(private http: HttpClient, private authService: AuthService) {}

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = cred.user;

      const token = await cred.user.getIdToken();

      const data = await this.fetchUserData();

      this.currentUserData = data;
      this.currentUserData$.next(data);

      return { ok: true };
    } catch (e: any) {
      console.error('Login error:', e);

      // Firebase suele venir con e.code
      const code = String(e?.code ?? '');

      // Mensajes “humanos”
      const message =
        code === 'auth/invalid-credential' ? 'Email o contraseña incorrectos.' :
        code === 'auth/user-not-found' ? 'No existe una cuenta con ese email.' :
        code === 'auth/wrong-password' ? 'Email o contraseña incorrectos.' :
        code === 'auth/too-many-requests' ? 'Demasiados intentos. Probá de nuevo más tarde.' :
        code === 'auth/network-request-failed' ? 'Problema de conexión. Revisá tu internet.' :
        'No pudimos iniciar sesión. Revisá tus datos e intentá de nuevo.';

      return { ok: false, message };
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.currentUserData = null;
    this.currentUserData$.next(null);

    await this.authService.logout();
  }

async fetchUserData(): Promise<any> {
  return await firstValueFrom(
    this.http.get(`${this.baseUrl}/api/v1/auth/me/full`)
  );
}
}
