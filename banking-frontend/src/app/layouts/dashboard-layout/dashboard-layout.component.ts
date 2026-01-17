import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserProfileModalComponent } from '../../shared/components/user-profile-modal/user-profile-modal.component';
import { Roles } from '../../core/enums/roles';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit {
  userRole: Roles | null = null;
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  this.userRole = this.authService.getUserRole();
  this.loadCurrentUser();
  this.setMenuItems();
}

  loadCurrentUser(): void {
    this.userService.getCurrentUserDetails().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Failed to load user details:', err);
      }
    });
  }

  setMenuItems(): void {
    switch (this.userRole) {
      case Roles.ADMIN:
        this.menuItems = [
          { label: 'User Table', route: '/admin/users', icon: 'table_view' },
          { label: 'Create User', route: '/admin/create-user', icon: 'person_add' }
        ];
        break;
      case Roles.RELATIONSHIP_MANAGER:
        this.menuItems = [
          { label: 'Dashboard', route: '/rm/dashboard', icon: 'dashboard' },
          { label: 'Create Client', route: '/rm/create-client', icon: 'person_add' },
          { label: 'Credit Requests', route: '/rm/credit-requests', icon: 'request_quote' }
        ];
        break;
      case Roles.ANALYST:
        this.menuItems = [
          { label: 'Dashboard', route: '/analyst/dashboard', icon: 'dashboard' },
        ];
        break;
    }
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileModalComponent, {
      width: '400px',
      data: this.currentUser
    });
  }

  logout(): void {
    this.authService.logout();
  }
}