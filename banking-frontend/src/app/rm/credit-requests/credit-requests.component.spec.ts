import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { CreditRequestsComponent } from './credit-requests.component';

describe('CreditRequestsComponent', () => {
  let component: CreditRequestsComponent;
  let fixture: ComponentFixture<CreditRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditRequestsComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
