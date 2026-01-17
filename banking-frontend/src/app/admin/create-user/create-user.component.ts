import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Roles } from '../../core/enums/roles';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  createUserForm: FormGroup;

  roles = [
    { label: 'Admin', value: Roles.ADMIN },
    { label: 'Relationship Manager', value: Roles.RELATIONSHIP_MANAGER },
    { label: 'Analyst', value: Roles.ANALYST }
  ];

  private apiUrl = `${environment.apiUrl}/auth/register`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.createUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createUserForm.value,
      active: true 
    };

    this.http.post(this.apiUrl, 
      payload, { 
        responseType: 'text' 
      })
      .subscribe({
        next: (msg) => {
          this.toastr.success(msg, 'User Created');
          this.createUserForm.reset();

          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1200);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to create user', 'Error');
        }
      });
  }
}
