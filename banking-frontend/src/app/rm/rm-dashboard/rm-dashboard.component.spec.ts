import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { RmDashboardComponent } from './rm-dashboard.component';

describe('RmDashboardComponent', () => {
  let component: RmDashboardComponent;
  let fixture: ComponentFixture<RmDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RmDashboardComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});