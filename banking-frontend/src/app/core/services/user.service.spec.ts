import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService} from './user.service';
import { User } from '../models/user.model';
import { Roles } from '../enums/roles';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: '1', username: 'admin', email: 'admin@test.com', role : Roles.ADMIN, active: true },
    { id: '2', username: 'rm1', email: 'rm@test.com', role: Roles.RELATIONSHIP_MANAGER, active: true },
    { id: '3', username: 'analyst1', email: 'analyst@test.com', role: Roles.ANALYST, active: false }
  ];

  const mockCurrentUser: User = {
    id: '1',
    username: 'admin',
    email: 'admin@test.com',
    role: Roles.ADMIN,
    active: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentUserDetails', () => {
    it('should fetch and store current user details', () => {
      service.getCurrentUserDetails().subscribe(user => {
        expect(user).toEqual(mockCurrentUser);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCurrentUser);
    });

    it('should update currentUser$ observable', (done) => {
      service.currentUser$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockCurrentUser);
          done();
        }
      });

      service.getCurrentUserDetails().subscribe();

      const req = httpMock.expectOne(`${service['apiUrl']}/users/me`);
      req.flush(mockCurrentUser);
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users', () => {
      service.getAllUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(3);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/admin/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('calculateUserStats', () => {
    it('should calculate user statistics correctly', () => {
      const stats = service.calculateUserStats(mockUsers);

      expect(stats.total).toBe(3);
      expect(stats.admin).toBe(1);
      expect(stats.rm).toBe(1);
      expect(stats.analyst).toBe(1);
    });

    it('should return zero stats for empty array', () => {
      const stats = service.calculateUserStats([]);

      expect(stats.total).toBe(0);
      expect(stats.admin).toBe(0);
      expect(stats.rm).toBe(0);
      expect(stats.analyst).toBe(0);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', () => {
      const userId = '2';
      const active = false;
      const responseMessage = 'User status updated successfully';

      service.updateUserStatus(userId, active).subscribe(response => {
        expect(response).toBe(responseMessage);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/admin/users/${userId}/status?active=false`);
      expect(req.request.method).toBe('PUT');
      req.flush(responseMessage);
    });

    it('should handle update status error', () => {
      const userId = '999';
      const active = true;

      service.updateUserStatus(userId, active).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/admin/users/${userId}/status?active=true`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const newUser: Partial<User> = {
        username: 'newuser',
        email: 'newuser@test.com',
        role: Roles.ADMIN,
        active: true
      };

      const createdUser: User = {
        id: '4',
        username: 'newuser',
        email: 'newuser@test.com',
        role: Roles.ADMIN,
        active: true,
        createdAt: '3024-01-01T00:00:00Z',
        updatedAt: '3024-01-01T00:00:00Z'
      };

      service.createUser(newUser).subscribe(user => {
        expect(user.id).toBe('4');
        expect(user).toEqual(createdUser);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/admin/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);

      req.flush(createdUser);// backend reponse
    });
  });


  describe('clearCurrentUser', () => {
    it('should clear current user', (done) => {
      // First set a user
      service.getCurrentUserDetails().subscribe(() => {
        // Then clear it
        service.clearCurrentUser();
        
        service.currentUser$.subscribe(user => {
          if (user === null) {
            expect(user).toBeNull();
            done();
          }
        });
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/users/me`);
      req.flush(mockCurrentUser);
    });
  });
});
