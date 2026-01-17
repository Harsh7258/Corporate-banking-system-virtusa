import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { provideRouter } from '@angular/router';

describe('jwtInterceptor (functional)', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getToken', 'isTokenExpired']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr(),
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists and is valid', () => {
    const mockToken = 'valid-jwt-token';
    tokenService.getToken.and.returnValue(mockToken);
    tokenService.isTokenExpired.and.returnValue(false);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('should not add Authorization header when token is missing', () => {
    tokenService.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({});
  });

  it('should not add Authorization header when token is expired', () => {
    tokenService.getToken.and.returnValue('expired-token');
    tokenService.isTokenExpired.and.returnValue(true);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({});
  });

  it('should handle 401 error and call toastr', () => {
    tokenService.getToken.and.returnValue('token');
    tokenService.isTokenExpired.and.returnValue(false);

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should handle 403 error', () => {
    tokenService.getToken.and.returnValue('token');
    tokenService.isTokenExpired.and.returnValue(false);

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should handle network error (status 0)', () => {
    tokenService.getToken.and.returnValue('token');
    tokenService.isTokenExpired.and.returnValue(false);

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(0);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should handle 500 server error', () => {
    tokenService.getToken.and.returnValue('token');
    tokenService.isTokenExpired.and.returnValue(false);

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(toastrService.error).toHaveBeenCalled();
  });
});