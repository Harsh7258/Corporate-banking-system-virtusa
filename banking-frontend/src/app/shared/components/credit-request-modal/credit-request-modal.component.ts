import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { CreditService, CreateCreditRequest } from '../../../rm/services/credit.service';
import { Client } from '../../../rm/services/rm.service';

@Component({
  selector: 'app-credit-request-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './credit-request-modal.component.html',
  styleUrls: ['./credit-request-modal.component.css']
})
export class CreditRequestModalComponent implements OnInit {
  creditForm!: FormGroup;
  loading = false;
  client: Client;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      client: Client 
    },
    private dialogRef: MatDialogRef<CreditRequestModalComponent>,
    private fb: FormBuilder,
    private creditService: CreditService,
    private toastr: ToastrService
  ) {
    this.client = data.client;
  }

  ngOnInit(): void {
    this.creditForm = this.fb.group({
      requestAmount: ['', [Validators.required, Validators.min(1000)]],
      tenureMonths: ['', [Validators.required, Validators.min(1), Validators.max(360)]],
      purpose: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.creditForm.invalid) {
      this.markFormGroupTouched(this.creditForm);
      return;
    }

    this.loading = true;

    const creditData: CreateCreditRequest = {
      clientId: this.client.id,
      requestAmount: this.creditForm.value.requestAmount,
      tenureMonths: this.creditForm.value.tenureMonths,
      purpose: this.creditForm.value.purpose
    };

    this.creditService.createCreditRequest(creditData).subscribe({
      next: (msg: string) => {
        this.loading = false;
        this.toastr.success(msg, 'Success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toastr.error(
          err?.error || 'Failed to create credit request',
          'Error'
        );
      }
    });
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

  get requestAmount() {
    return this.creditForm.get('requestAmount');
  }

  get tenureMonths() {
    return this.creditForm.get('tenureMonths');
  }

  get purpose() {
    return this.creditForm.get('purpose');
  }
}
