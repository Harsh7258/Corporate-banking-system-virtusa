import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserStats } from '../../core/models/user-stats.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    StatCardComponent],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent implements OnInit {
  users: User[] = [];
  userStats: UserStats = { total: 0, admin: 0, rm: 0, analyst: 0 };
  displayedColumns: string[] = ['username', 'role', 'email', 'active', 'actions'];
  loading = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.userStats = this.userService.calculateUserStats(users);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.toastr.error('Failed to load users', 'Error');
        this.loading = false;
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.active;
    
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        user.active = newStatus;
        this.toastr.success(`${response}: ${user.username}`, 'Success');
      },
      error: (err) => {
        console.error('Failed to update user status:', err);
        this.toastr.error('Failed to update user status', 'Error');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'RELATIONSHIP_MANAGER': return 'role-rm';
      case 'ANALYST': return 'role-analyst';
      default: return '';
    }
  }
}
