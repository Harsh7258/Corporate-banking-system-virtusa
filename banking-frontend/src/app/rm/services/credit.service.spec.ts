import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CreditService, CreditRequestWithClient, CreateCreditRequest, CreditDecision } from './credit.service';

describe('CreditService', () => {
  let service: CreditService;
  let httpMock: HttpTestingController;

  const mockCreditRequests: CreditRequestWithClient[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Tech Corp',
      rmName: 'John RM',
      requestAmount: 50000,
      tenureMonths: 12,
      purpose: 'Working capital',
      status: 'PENDING',
      remarks: ''
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Finance Ltd',
      rmName: 'Jane RM',
      requestAmount: 100000,
      tenureMonths: 24,
      purpose: 'Expansion',
      status: 'APPROVED',
      remarks: 'Good credit history'
    },
    {
      id: '3',
      clientId: 'client3',
      clientName: 'Retail Inc',
      rmName: 'Bob RM',
      requestAmount: 75000,
      tenureMonths: 18,
      purpose: 'Inventory',
      status: 'REJECTED',
      remarks: 'Insufficient documentation'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CreditService]
    });

    service = TestBed.inject(CreditService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCreditRequests', () => {
    it('should fetch all credit requests', () => {
      service.getAllCreditRequests().subscribe(requests => {
        expect(requests).toEqual(mockCreditRequests);
        expect(requests.length).toBe(3);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreditRequests);

    });
  });

  describe('createCreditRequest', () => {
    it('should create a new credit request', () => {
      const newRequest: CreateCreditRequest = {
        clientId: 'client4',
        requestAmount: 60000,
        tenureMonths: 15,
        purpose: 'Equipment purchase'
      };

      service.createCreditRequest(newRequest).subscribe(response => {
        expect(response).toBe('SUCCESS');
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRequest);

      req.flush('SUCCESS');
    });
  });

  describe('updateCreditDecision', () => {
    it('should update credit decision with approval', () => {
      const creditId = '1';
      const decision: CreditDecision = {
        status: 'APPROVED',
        remarks: 'All documents verified'
      };
      const responseMessage = 'Credit request approved successfully';

      service.updateCreditDecision(creditId, decision).subscribe(response => {
        expect(response).toBe(responseMessage);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${creditId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(decision);
      req.flush(responseMessage);
    });

    it('should update credit decision with rejection', () => {
      const creditId = '1';
      const decision: CreditDecision = {
        status: 'REJECTED',
        remarks: 'Incomplete documentation'
      };
      const responseMessage = 'Credit request rejected';

      service.updateCreditDecision(creditId, decision).subscribe(response => {
        expect(response).toBe(responseMessage);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${creditId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(responseMessage);
    });

    it('should handle update error', () => {
      const creditId = '999';
      const decision: CreditDecision = {
        status: 'APPROVED',
        remarks: 'Test'
      };

      service.updateCreditDecision(creditId, decision).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${creditId}`);
      req.flush({ 
        message: 'Credit request not found' }, { 
        status: 404, 
        statusText: 'Not Found' 
      });
    });
  });

  describe('calculateCreditStats', () => {
    it('should calculate credit statistics correctly', () => {
      const stats = service.calculateCreditStats(mockCreditRequests);

      expect(stats.total).toBe(3);
      expect(stats.approved).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.rejected).toBe(1);
    });

    it('should return zero stats for empty array', () => {
      const stats = service.calculateCreditStats([]);

      expect(stats.total).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.rejected).toBe(0);
    });

    it('should handle credits with undefined status', () => {
      const creditsWithUndefined = [
        { ...mockCreditRequests[0], status: undefined as any }
      ];

      const stats = service.calculateCreditStats(creditsWithUndefined);

      expect(stats.total).toBe(1);
      expect(stats.approved).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.rejected).toBe(0);
    });
  });

  describe('getCreditRequestById', () => {
    it('should fetch credit request by ID', () => {
      const creditId = '1';

      service.getCreditRequestById(creditId).subscribe(request => {
        expect(request.id).toBe(creditId);
        expect(request.clientName).toBe('Tech Corp');
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${creditId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreditRequests[0]);
    });
  });

  describe('getCreditRequestsByClient', () => {
    it('should fetch credit requests by client ID', () => {
      const clientId = 'client1';
      const clientRequests = [mockCreditRequests[0]];

      service.getCreditRequestsByClient(clientId).subscribe(requests => {
        expect(requests).toEqual(clientRequests);
        expect(requests.length).toBe(1);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${clientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(clientRequests);
    });
  });
});
