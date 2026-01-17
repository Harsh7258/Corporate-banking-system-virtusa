import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const toastr = inject(ToastrService);

  const token = tokenService.getToken();

  if (token && !tokenService.isTokenExpired(token)) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        toastr.error('Session expired. Please login again.', 'Unauthorized');
      } else if (error.status === 403) {
        toastr.error('You do not have permission to access this resource.', 'Forbidden');
      } else if (error.status === 0) {
        toastr.error('Unable to connect to server.', 'Network Error');
      } else if (error.status >= 500) {
        toastr.error('Server error. Please try again later.', 'Server Error');
      }

      return throwError(() => error);
    })
  );
};