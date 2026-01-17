import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreditRequest {
  id?: string;
  clientId: string;
  submittedBy?: string;
  requestAmount: number;
  tenureMonths: number;
  purpose: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt?: string;
}

export interface CreditRequestWithClient extends CreditRequest {
  clientName?: string;
  industry?: string;
  rmName?: string;
  rmEmail?: string;
}

export interface CreditDecision {
  status: 'APPROVED' | 'REJECTED';
  remarks: string;
}

export interface CreateCreditRequest {
  clientId: string;
  requestAmount: number;
  tenureMonths: number;
  purpose: string;
}

export interface CreditStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = `${environment.apiUrl}/credit-requests`;

  constructor(private http: HttpClient) {}

  // RM + Analyst
  getAllCreditRequests(): Observable<CreditRequestWithClient[]> {
    return this.http.get<CreditRequestWithClient[]>(`${this.apiUrl}/`);
  }

  // RM only
  createCreditRequest(data: CreateCreditRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/`,
      data,
      { responseType: 'text' }
    );
  }

  // RM + Analyst
  getCreditRequestById(id: string): Observable<CreditRequestWithClient> {
    return this.http.get<CreditRequestWithClient>(`${this.apiUrl}/${id}`);
  }

  // Get credit requests by client ID (for analyst only)
  getCreditRequestsByClient(clientId: string): Observable<CreditRequest[]> {
    return this.http.get<CreditRequest[]>(`${this.apiUrl}/${clientId}`);
  }

  updateCreditDecision(creditId: string, decision: CreditDecision): Observable<string> {
    return this.http.put<string>(
      `${this.apiUrl}/${creditId}`,
      decision,
      { responseType: 'text' as 'json' }
    );
  }

  calculateCreditStats(credits: CreditRequestWithClient[]): CreditStats {
    return {
      total: credits.length,
      approved: credits.filter(c => c.status === 'APPROVED').length,
      pending: credits.filter(c => c.status === 'PENDING').length,
      rejected: credits.filter(c => c.status === 'REJECTED').length
    };
  }
}
