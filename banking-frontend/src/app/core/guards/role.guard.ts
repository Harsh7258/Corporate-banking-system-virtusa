import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Roles } from '../enums/roles';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Roles[];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.toastr.error('Access denied', 'Unauthorized');
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (expectedRoles && !expectedRoles.includes(userRole)) {
      this.toastr.error('You do not have permission to access this page', 'Access Denied');
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
