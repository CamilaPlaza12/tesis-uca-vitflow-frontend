import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth_service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) => {
        if (!token) return next.handle(req);

        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });

        return next.handle(cloned);
      })
    );
  }
}
