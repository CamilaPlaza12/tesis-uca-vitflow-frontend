// src/app/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { auth } from '../service/firebaseconfig';
import { getIdToken } from 'firebase/auth';
import { AuthService } from '../service/auth_service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private readonly API_BASE = 'http://localhost:8000/api/v1';
  //private readonly API_BASE = 'https://vitflow-backend.onrender.com/api/v1';

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const isApiCall = req.url.startsWith(this.API_BASE);

    if (!isApiCall) {
      return next.handle(req);
    }

    // 🔥 NO token para onboarding (backoffice + wizard)
    if (req.url.includes('/hospital-onboarding')) {
      return next.handle(req);
    }

    return from(this.attachToken(req, false)).pipe(
      switchMap((authedReq) => next.handle(authedReq)),
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;

          return from(this.attachToken(req, true)).pipe(
            switchMap((retryReq) => {
              this.isRefreshing = false;
              return next.handle(retryReq);
            }),
            catchError((retryError: HttpErrorResponse) => {
              this.isRefreshing = false;

              if (retryError.status === 401) {
                console.error('Token refresh failed. Logging out.');
                this.authService.logout();
              }

              return throwError(() => retryError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  private async attachToken(req: HttpRequest<any>, forceRefresh = false): Promise<HttpRequest<any>> {
    const user = auth.currentUser;
    if (!user) return req;

    try {
      const token = await getIdToken(user, forceRefresh);

      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

    } catch (error) {
      console.error('Error getting token:', error);
      this.authService.logout();
      return req;
    }
  }
}
