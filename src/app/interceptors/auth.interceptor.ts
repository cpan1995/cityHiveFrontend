import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const tokenService = inject(TokenService);
 const router = inject(Router);
 
 const token = tokenService.getToken();
 const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/signup');
 
 let authReq = req;
 if (token && !isAuthEndpoint) {
   authReq = req.clone({
     setHeaders: {
       Authorization: `Bearer ${token}`
     }
   });
 }
 
 return next(authReq).pipe(
   catchError((error: HttpErrorResponse) => {
     if (error.status === 401 && !isAuthEndpoint) {
       tokenService.removeToken();
       router.navigate(['/login']);
     }
     
     return throwError(() => error);
   })
 );
};