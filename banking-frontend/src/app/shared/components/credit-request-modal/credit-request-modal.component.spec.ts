import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { CreditRequestModalComponent } from './credit-request-modal.component';

describe('CreditRequestModalComponent', () => {
  let component: CreditRequestModalComponent;
  let fixture: ComponentFixture<CreditRequestModalComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockData = {
    client: {
      id: '1',
      companyName: 'Test Company',
      industry: 'Software',
      annualTurnover: 10
    },
    rmId: 'rm123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditRequestModalComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideToastr(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
