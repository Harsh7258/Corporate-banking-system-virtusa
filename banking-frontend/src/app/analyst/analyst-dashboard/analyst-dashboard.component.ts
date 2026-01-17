import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { CreditService, CreditRequestWithClient, CreditStats } from '../../rm/services/credit.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CreditDetailsModalComponent } from '../../shared/components/credit-details-modal/credit-details-modal.component';
import { UpdateStatusModalComponent } from '../../shared/components/update-status-modal/update-status-modal.component';

@Component({
  selector: 'app-analyst-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    StatCardComponent
  ],
  templateUrl: './analyst-dashboard.component.html',
  styleUrls: ['./analyst-dashboard.component.css']
})
export class AnalystDashboardComponent implements OnInit {
  creditRequests: CreditRequestWithClient[] = [];
  stats: CreditStats = { total: 0, approved: 0, pending: 0, rejected: 0 };
  displayedColumns: string[] = ['clientName', 'rmName', 'requestAmount', 'tenureMonths', 'purpose', 'details', 'status', 'actions'];
  loading = false;

  constructor(
    private creditService: CreditService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCreditRequests();
  }

  loadCreditRequests(): void {
    this.loading = true;
    this.creditService.getAllCreditRequests().subscribe({
      next: (requests) => {
        this.creditRequests = requests;
        this.stats = this.creditService.calculateCreditStats(requests);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load credit requests:', err);
        this.toastr.error('Failed to load credit requests', 'Error');
        this.loading = false;
      }
    });
  }

  openDetailsModal(credit: CreditRequestWithClient): void {
    this.dialog.open(CreditDetailsModalComponent, {
      width: '600px',
      data: credit
    });
  }

  openUpdateStatusModal(credit: CreditRequestWithClient): void {
    const dialogRef = this.dialog.open(UpdateStatusModalComponent, {
      width: '500px',
      data: credit
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCreditRequests(); // Refresh data
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

  isPending(status: string): boolean {
    return status === 'PENDING';
  }
}
