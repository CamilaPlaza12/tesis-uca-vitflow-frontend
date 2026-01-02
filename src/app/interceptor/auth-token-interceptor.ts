import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth_service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

intercept(req: HttpRequest<any>, next: HttpHandler) {
  console.log('🔥 INTERCEPTOR:', req.url);

  return from(this.authService.getIdToken()).pipe(
    switchMap((token) => {
      console.log('🔑 TOKEN:', token);

      if (!token) return next.handle(req);

      return next.handle(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      );
    })
  );
}
}