import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ToastrService } from 'ngx-toastr';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { Roles } from '../enums/roles';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    role: Roles.ADMIN
  };

  beforeEach(() => {
    tokenService = jasmine.createSpyObj('TokenService', [
      'saveToken',
      'saveRole',
      'clearTokens',
      'getToken',
      'getRole',
      'isTokenExpired'
    ]);

    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        { provide: TokenService, useValue: tokenService },
        { provide: ToastrService, useValue: toastr }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully and update auth state', () => {
    const credentials: LoginRequest = {
      email: 'test@test.com',
      password: 'password123'
    };

    spyOn(router, 'navigate');

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(tokenService.saveToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(tokenService.saveRole).toHaveBeenCalledWith(mockLoginResponse.role);
      expect(toastr.success).toHaveBeenCalled();
    });

    const req = httpMock.expectOne('http://localhost:8888/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockLoginResponse);
  });

  it('should handle login error', () => {
    const credentials: LoginRequest = {
      email: 'test@test.com',
      password: 'wrong'
    };

    service.login(credentials).subscribe({
      next: () => fail('should fail'),
      error: () => {
        expect(toastr.error).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('http://localhost:8888/api/auth/login');
    req.flush(
      { message: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should logout and reset state', () => {
    spyOn(router, 'navigate');

    service.logout();

    expect(tokenService.clearTokens).toHaveBeenCalled();
    expect(toastr.info).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should return authentication state', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return null current user initially', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return null role initially', () => {
    expect(service.getUserRole()).toBeNull();
  });

  it('should return false for hasRole', () => {
    expect(service.hasRole(Roles.ADMIN)).toBeFalse();
  });
});

