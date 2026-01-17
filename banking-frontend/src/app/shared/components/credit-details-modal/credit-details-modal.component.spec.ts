import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CreditDetailsModalComponent } from './credit-details-modal.component';

describe('CreditDetailsModalComponent', () => {
  let component: CreditDetailsModalComponent;
  let fixture: ComponentFixture<CreditDetailsModalComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockData = {
    id: '1',
    clientId: 'client1',
    clientName: 'Test Client',
    requestAmount: 50000,
    tenureMonths: 12,
    purpose: 'Test purpose',
    status: 'PENDING'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditDetailsModalComponent],
      providers: [
        provideAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
