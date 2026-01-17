import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Roles } from '../enums/roles';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let toastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user has required role', () => {
    authService.getUserRole.and.returnValue(Roles.ADMIN);

    const route: any = {
      data: { roles: [Roles.ADMIN, Roles.RELATIONSHIP_MANAGER] }
    };

    const result = guard.canActivate(route);

    expect(result).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have required role', () => {
    authService.getUserRole.and.returnValue(Roles.RELATIONSHIP_MANAGER);

    const route: any = {
      data: { roles: [Roles.ADMIN] }
    };

    const result = guard.canActivate(route);

    expect(result).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(toastrService.error).toHaveBeenCalledWith(
      'You do not have permission to access this page',
      'Access Denied'
    );
  });

  it('should deny access and redirect to login when user has no role', () => {
    authService.getUserRole.and.returnValue(null);

    const route: any = {
      data: { roles: ['ADMIN'] }
    };

    const result = guard.canActivate(route);

    expect(result).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(toastrService.error).toHaveBeenCalledWith('Access denied', 'Unauthorized');
  });

  it('should allow access when no role restriction is specified', () => {
    authService.getUserRole.and.returnValue(Roles.RELATIONSHIP_MANAGER);

    const route: any = {
      data: {}
    };

    const result = guard.canActivate(route);

    expect(result).toBeTruthy();
  });
});