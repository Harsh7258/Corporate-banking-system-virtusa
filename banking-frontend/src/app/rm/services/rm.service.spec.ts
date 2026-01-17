import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RmService, Client, CreateClientRequest } from './rm.service';

describe('RmService', () => {
  let service: RmService;
  let httpMock: HttpTestingController;

  const mockClients: Client[] = [
    {
      id: '1',
      companyName: 'Tech Corp',
      industry: 'Software',
      address: '123 Tech St',
      primaryContact: { name: 'John Doe', email: 'john@tech.com', phone: '1234567890' },
      annualTurnover: 10.5,
      documentsSubmitted: true
    },
    {
      id: '2',
      companyName: 'Finance Ltd',
      industry: 'Finance',
      address: '456 Money Ave',
      primaryContact: { name: 'Jane Smith', email: 'jane@finance.com', phone: '0987654321' },
      annualTurnover: 25.3,
      documentsSubmitted: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RmService]
    });

    service = TestBed.inject(RmService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllClients', () => {
    it('should fetch all clients', () => {
      service.getAllClients().subscribe(clients => {
        expect(clients).toEqual(mockClients);
        expect(clients.length).toBe(2);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });

    it('should handle error when fetching clients fails', () => {
      service.getAllClients().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createClient', () => {
    it('should create a new client', () => {
      const newClientRequest: CreateClientRequest = {
        companyName: 'New Company',
        industry: 'Manufacturing',
        address: '789 Factory Rd',
        primaryContact: {
          name: 'Bob Johnson',
          email: 'bob@company.com',
          phone: '5555555555'
        },
        annualTurnover: 15.0,
        documentsSubmitted: false
      };

      service.createClient(newClientRequest).subscribe(response => {
        expect(response).toBe('SUCCESS');
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newClientRequest);

      req.flush('SUCCESS');
    });

    it('should handle validation error when creating client', () => {
      const invalidClient: CreateClientRequest = {
        companyName: '',
        industry: 'Software',
        address: '123 St',
        primaryContact: { name: 'Test', email: 'invalid-email', phone: '123' },
        annualTurnover: -1,
        documentsSubmitted: false
      };

      service.createClient(invalidClient).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/`);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // describe('getRmStats', () => {
  //   it('should fetch RM statistics', () => {
  //     const mockStats = { totalClients: 5, totalCreditRequests: 12 };

  //     service.getRmStats().subscribe(stats => {
  //       expect(stats).toEqual(mockStats);
  //       expect(stats.totalClients).toBe(5);
  //       expect(stats.totalCreditRequests).toBe(12);
  //     });

  //     const req = httpMock.expectOne(`${service['apiUrl']}/rm/stats`);
  //     expect(req.request.method).toBe('GET');
  //     req.flush(mockStats);
  //   });
  // });

  describe('getClientById', () => {
    it('should fetch client by ID', () => {
      const clientId = '1';

      service.getClientById(clientId).subscribe(client => {
        expect(client).toEqual(mockClients[0]);
        expect(client.id).toBe(clientId);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${clientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients[0]);
    });

    it('should handle client not found error', () => {
      const clientId = '999';

      service.getClientById(clientId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${clientId}`);
      req.flush({ message: 'Client not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
