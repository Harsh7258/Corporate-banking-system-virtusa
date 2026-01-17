import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { RmService, CreateClientRequest } from '../services/rm.service';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {
  clientForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private rmService: RmService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      industry: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      primaryContactName: ['', [Validators.required, Validators.minLength(2)]],
      primaryContactEmail: ['', [Validators.required, Validators.email]],
      primaryContactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      annualTurnover: ['', [Validators.required, Validators.min(0)]],
      documentsSubmitted: [false]
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.loading = true;

      const clientData: CreateClientRequest = {
        companyName: this.clientForm.value.companyName,
        industry: this.clientForm.value.industry,
        address: this.clientForm.value.address,
        primaryContact: {
          name: this.clientForm.value.primaryContactName,
          email: this.clientForm.value.primaryContactEmail,
          phone: this.clientForm.value.primaryContactPhone
        },
        annualTurnover: this.clientForm.value.annualTurnover,
        documentsSubmitted: this.clientForm.value.documentsSubmitted
      };

      this.rmService.createClient(clientData).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastr.success(`${response}`, 'Success');
          this.router.navigate(['/rm/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to create client:', err);
          const errorMsg = err.error?.message || 'Failed to create client';
          this.toastr.error(errorMsg, 'Error');
        }
      });
    } else {
      this.markFormGroupTouched(this.clientForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.clientForm.reset({ documentsSubmitted: false });
  }

  get companyName() { 
    return this.clientForm.get('companyName'); 
  }
  get industry() { 
    return this.clientForm.get('industry'); 
  }
  get address() { 
    return this.clientForm.get('address'); 
  }
  get primaryContactName() { 
    return this.clientForm.get('primaryContactName'); 
  }
  get primaryContactEmail() { 
    return this.clientForm.get('primaryContactEmail'); 
  }
  get primaryContactPhone() { 
    return this.clientForm.get('primaryContactPhone'); 
  }
  get annualTurnover() { 
    return this.clientForm.get('annualTurnover'); 
  }
}
