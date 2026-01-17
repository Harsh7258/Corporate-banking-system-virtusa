import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { UpdateStatusModalComponent } from './update-status-modal.component';

describe('UpdateStatusModalComponent', () => {
  let component: UpdateStatusModalComponent;
  let fixture: ComponentFixture<UpdateStatusModalComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockData = {
    id: '1',
    clientName: 'Test Client',
    requestAmount: 50000,
    tenureMonths: 12,
    purpose: 'Test purpose',
    status: 'PENDING'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStatusModalComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideToastr(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});