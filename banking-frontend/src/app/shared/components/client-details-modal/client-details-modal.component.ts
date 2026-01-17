import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RmService, Client } from '../../../rm/services/rm.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-details-modal.component.html',
  styleUrls: ['./client-details-modal.component.css']
})
export class ClientDetailsModalComponent implements OnInit {
  client: Client | null = null;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<ClientDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clientId: string },
    private rmService: RmService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClientDetails();
  }

  loadClientDetails(): void {
    this.loading = true;
    
    this.rmService.getClientById(this.data.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load client details:', err);
        this.toastr.error('Failed to load client details', 'Error');
        this.loading = false;
        this.dialogRef.close();
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
