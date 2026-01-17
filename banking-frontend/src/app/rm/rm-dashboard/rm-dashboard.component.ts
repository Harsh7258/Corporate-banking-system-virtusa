import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { RmService, Client, ClientStats } from '../services/rm.service';
import { CreditService } from '../services/credit.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CreditRequestModalComponent } from '../../shared/components/credit-request-modal/credit-request-modal.component';
import { ClientDetailsModalComponent } from '../../shared/components/client-details-modal/client-details-modal.component';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-rm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    StatCardComponent
  ],
  templateUrl: './rm-dashboard.component.html',
  styleUrl: './rm-dashboard.component.css'
})
export class RmDashboardComponent {
  clients: Client[] = [];
  industries: string[] = [];

  companyName: string = '';
  selectedIndustry: string = '';

  stats: ClientStats = {
    totalClients: 0,
    totalCreditRequests: 0
  };

  displayedColumns: string[] = [
    'companyName',
    'industry',
    'primaryContact',
    'annualTurnover',
    'documentsSubmitted',
    'details',
    'actions'
  ];

  loading = false;

  constructor(
    private rmService: RmService,
    private creditService: CreditService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadStats();
    this.loadIndustries();
  }

  loadClients(): void {
    this.loading = true;

    this.rmService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.toastr.error('Failed to load clients', 'Error');
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    // Clients count
    this.rmService.getAllClients().subscribe({
      next: (clients) => {
        this.stats.totalClients = clients.length;
      }
    });

    // Credit requests count
    this.creditService.getAllCreditRequests().subscribe({
      next: (credits) => {
        this.stats.totalCreditRequests = credits.length;
      }
    });
  }

  loadIndustries(): void {
    this.rmService.getIndustries().subscribe({
      next: (industries) => (this.industries = industries),
      error: () => this.toastr.error('Failed to load industries', 'Error')
    });
  }

  applyFilters(): void {
    this.loading = true;

    this.rmService
      .searchClients(this.companyName, this.selectedIndustry)
      .subscribe({
        next: (clients) => {
          this.clients = clients;
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Search failed', 'Error');
          this.loading = false;
        }
      });
  }

  clearFilters(): void {
    this.companyName = '';
    this.selectedIndustry = '';
    this.loadClients();
  }

  openClientDetailsModal(client: Client): void {
    this.dialog.open(ClientDetailsModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { clientId: client.id }
    });
  }

  openCreditRequestModal(client: Client): void {
    const dialogRef = this.dialog.open(CreditRequestModalComponent, {
      width: '600px',
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStats();
      }
    });
  }
}