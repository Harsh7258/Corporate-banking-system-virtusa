import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveToken and getToken', () => {
    it('should save and retrieve token', () => {
      const token = 'test-token-123';
      service.saveToken(token);
      expect(service.getToken()).toBe(token);
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should emit token value to subscribers', (done) => {
      const token = 'test-token-123';
      service.token$.subscribe(value => {
        if (value === token) {
          expect(value).toBe(token);
          done();
        }
      });
      service.saveToken(token);
    });
  });

  describe('saveRefreshToken and getRefreshToken', () => {
    it('should save and retrieve refresh token', () => {
      const refreshToken = 'refresh-token-456';
      service.saveRefreshToken(refreshToken);
      expect(service.getRefreshToken()).toBe(refreshToken);
    });
  });

  describe('saveRole and getRole', () => {
    it('should save and retrieve role data', () => {
      const user = { role: 'ADMIN' };
      service.saveRole(user.role);
      const retrieved = service.getRole();
      expect(retrieved).toEqual(user.role);
    });

    it('should return null when no user is saved', () => {
      expect(service.getRole()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear all tokens and user data', () => {
      service.saveToken('token');
      service.saveRefreshToken('refresh');
      service.saveRole('ADMIN');

      service.clearTokens();

      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getRole()).toBeNull();
    });

    it('should emit null to token subscribers after clearing', (done) => {
      service.saveToken('token');
      service.token$.subscribe(value => {
        if (value === null) {
          expect(value).toBeNull();
          done();
        }
      });
      service.clearTokens();
    });
  });

  describe('isTokenAvailable', () => {
    it('should return true when token exists', () => {
      service.saveToken('token');
      expect(service.isTokenAvailable()).toBeTruthy();
    });

    it('should return false when token does not exist', () => {
      expect(service.isTokenAvailable()).toBeFalsy();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const payload = { userId: '123', role: 'ADMIN' };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      const decoded = service.decodeToken(token);
      expect(decoded).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      const decoded = service.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 }; // 1 hour ago
      const token = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.signature';
      service.saveToken(token);
      expect(service.isTokenExpired()).toBeTruthy();
    });

    it('should return false for valid token', () => {
      const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour future
      const token = 'header.' + btoa(JSON.stringify(validPayload)) + '.signature';
      service.saveToken(token);
      expect(service.isTokenExpired()).toBeFalsy();
    });

    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBeTruthy();
    });
  });
});
