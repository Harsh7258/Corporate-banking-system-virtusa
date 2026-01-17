import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { CreditService, CreditRequestWithClient, CreditDecision } from '../../../rm/services/credit.service';

@Component({
  selector: 'app-update-status-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './update-status-modal.component.html',
  styleUrls: ['./update-status-modal.component.css']
})
export class UpdateStatusModalComponent implements OnInit {
  updateForm!: FormGroup;
  loading = false;
  credit: CreditRequestWithClient;

  statusOptions = [
    { value: 'APPROVED', label: 'Approved', icon: 'check_circle', color: 'success' },
    { value: 'REJECTED', label: 'Rejected', icon: 'cancel', color: 'error' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreditRequestWithClient,
    private dialogRef: MatDialogRef<UpdateStatusModalComponent>,
    private fb: FormBuilder,
    private creditService: CreditService,
    private toastr: ToastrService
  ) {
    this.credit = data;
  }

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      status: [this.credit.status === 'PENDING' ? '' : this.credit.status, [Validators.required]],
      remarks: [this.credit.remarks || '', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      this.loading = true;

      const decision: CreditDecision = {
        status: this.updateForm.value.status,
        remarks: this.updateForm.value.remarks
      };

      this.creditService.updateCreditDecision(this.credit.id!, decision).subscribe({
        next: (response) => {
          this.loading = false;
          const statusText = decision.status === 'APPROVED' ? 'approved' : 'rejected';
          this.toastr.success(`${response}: ${statusText}`, 'Success');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to update credit status:', err);
          const errorMsg = err.error?.message || 'Failed to update credit status';
          this.toastr.error(errorMsg, 'Error');
        }
      });
    } else {
      this.markFormGroupTouched(this.updateForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  get status() {
    return this.updateForm.get('status');
  }

  get remarks() {
    return this.updateForm.get('remarks');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
