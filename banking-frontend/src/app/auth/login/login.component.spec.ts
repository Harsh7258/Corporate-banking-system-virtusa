import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Roles } from '../../core/enums/roles';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login'], {
      state$: of({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      })
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).overrideComponent(LoginComponent, {
      set: { template: '' }  
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.value).toEqual({
      email: '',
      password: ''
    });
  });

  it('should mark form invalid when empty', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should validate email as required', () => {
    const email = component.loginForm.get('email');
    email?.setValue('');
    expect(email?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid');
    expect(email?.hasError('email')).toBeTrue();
  });

  it('should validate password minlength', () => {
    const password = component.loginForm.get('password');
    password?.setValue('12345');
    expect(password?.hasError('minlength')).toBeTrue();
  });

  it('should call authService.login when form is valid', () => {
    authService.login.and.returnValue(
      of({ token: 'fake-token', role: Roles.ADMIN })
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
  });

  it('should not call authService.login when form is invalid', () => {
    component.loginForm.setValue({
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should handle login error gracefully', () => {
    authService.login.and.returnValue(
      throwError(() => new Error('Login failed'))
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: 'wrongpass'
    });

    expect(() => component.onSubmit()).not.toThrow();
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = spyOn<any>(component['destroy$'], 'next');
    const completeSpy = spyOn<any>(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
