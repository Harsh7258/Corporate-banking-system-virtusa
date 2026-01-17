import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CreditRequestWithClient } from '../../../rm/services/credit.service';

@Component({
  selector: 'app-credit-details-modal',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule],
  templateUrl: './credit-details-modal.component.html',
  styleUrl: './credit-details-modal.component.css'
})
export class CreditDetailsModalComponent {
  credit: CreditRequestWithClient;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreditRequestWithClient,
    private dialogRef: MatDialogRef<CreditDetailsModalComponent>
  ) {
    this.credit = data;
  }

  close(): void {
    this.dialogRef.close();
  }

  getStatusClass(status: string | undefined): string {
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
