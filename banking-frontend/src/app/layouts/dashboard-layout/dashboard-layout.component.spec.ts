import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { Roles } from '../../core/enums/roles';

describe('DashboardLayoutComponent', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let toastrService: jasmine.SpyObj<ToastrService>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@test.com',
    role: Roles.ADMIN,
    active: true
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole', 'logout']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUserDetails']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['info', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardLayoutComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    authService.getUserRole.and.returnValue(Roles.ADMIN);
    userService.getCurrentUserDetails.and.returnValue(of(mockUser));

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user on init', () => {
    fixture.detectChanges();

    expect(userService.getCurrentUserDetails).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should set menu items for ADMIN role', () => {
    authService.getUserRole.and.returnValue(Roles.ADMIN);
    component.ngOnInit();

    expect(component.menuItems.length).toBe(2);
    expect(component.menuItems[0].label).toBe('User Table');
    expect(component.menuItems[1].label).toBe('Create User');
  });

  it('should set menu items for RM role', () => {
    authService.getUserRole.and.returnValue(Roles.RELATIONSHIP_MANAGER);
    component.ngOnInit();

    expect(component.menuItems.length).toBe(3);
    expect(component.menuItems[0].label).toBe('Dashboard');
    expect(component.menuItems[1].label).toBe('Create Client');
    expect(component.menuItems[2].label).toBe('Credit Requests');
  });

  it('should set menu items for ANALYST role', () => {
    authService.getUserRole.and.returnValue(Roles.ANALYST);
    component.ngOnInit();

    expect(component.menuItems.length).toBe(1);
    expect(component.menuItems[0].label).toBe('Dashboard');
  });

  it('should call logout on logout button click', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should display user role badge', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const badge = compiled.querySelector('.role-badge');

    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('ADMIN');
  });

  it('should render sidebar navigation items', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const navItems = compiled.querySelectorAll('.nav-item');

    expect(navItems.length).toBe(component.menuItems.length);
  });

  it('should render logout button in toolbar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const logoutBtn = compiled.querySelector('.logout-btn');

    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain('Logout');
  });

  it('should handle user service error gracefully', () => {
    userService.getCurrentUserDetails.and.returnValue(
      throwError(() => new Error('Failed to load user'))
    );

    fixture.detectChanges();

    expect(component.currentUser).toBeNull();
  });
});