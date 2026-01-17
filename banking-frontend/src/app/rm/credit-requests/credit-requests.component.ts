import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { CreditService, CreditRequestWithClient } from '../services/credit.service';

@Component({
  selector: 'app-credit-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './credit-requests.component.html',
  styleUrls: ['./credit-requests.component.css']
})
export class CreditRequestsComponent implements OnInit {
  creditRequests: CreditRequestWithClient[] = [];
  displayedColumns: string[] = ['clientName', 'requestAmount', 'tenureMonths', 'purpose', 'status', 'remarks'];
  loading = false;

  constructor(
    private creditService: CreditService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCreditRequests();
  }

  loadCreditRequests(): void {
    this.loading = true;

    this.creditService.getAllCreditRequests().subscribe({
      next: (requests) => {
        this.creditRequests = requests || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        if (err.status !== 401) {
          this.toastr.error('Failed to load credit requests', 'Error');
        }
      }
    });
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      default: return 'status-pending';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
