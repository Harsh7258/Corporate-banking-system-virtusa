import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PrimaryContact {
  name: string;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  companyName: string;
  industry: string;
  address: string;
  primaryContact: PrimaryContact;
  annualTurnover: number;
  documentsSubmitted: boolean;
  rmId?: string;
  createdAt?: string;
}

export interface CreateClientRequest {
  companyName: string;
  industry: string;
  address: string;
  primaryContact: PrimaryContact;
  annualTurnover: number;
  documentsSubmitted: boolean;
}

export interface ClientStats {
  totalClients: number;
  totalCreditRequests: number;
}

@Injectable({
  providedIn: 'root'
})
export class RmService {
  private apiUrl = `${environment.apiUrl}/rm/clients`;

  constructor(private http: HttpClient) {}

  // Get all clients for logged-in RM
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/`);
  }

  // Create new client
  createClient(clientData: CreateClientRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/`,
      clientData,
      { responseType: 'text' });
  }

  // Get client by ID
  getClientById(clientId: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`);
  }

  // (Optional) search
  searchClients(companyName?: string, industry?: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/search`, {
      params: {
        companyName: companyName ?? '',
        industry: industry ?? ''
      }
    });
  }

  // (Optional) industries
  getIndustries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/industries`);
  }
}
