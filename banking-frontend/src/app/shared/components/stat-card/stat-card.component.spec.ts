import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent, MatIconModule, MatCardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title correctly', () => {
    component.title = 'Total Users';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-title').textContent).toContain('Total Users');
  });

  it('should display value correctly', () => {
    component.value = 150;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-value').textContent).toContain('150');
  });

  it('should display subtitle when provided', () => {
    component.subtitle = 'Active users';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const subtitle = compiled.querySelector('.card-subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Active users');
  });

  it('should not display subtitle when not provided', () => {
    component.subtitle = '';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const subtitle = compiled.querySelector('.card-subtitle');
    expect(subtitle).toBeFalsy();
  });

  it('should display icon correctly', () => {
    component.icon = 'people';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('mat-icon');
    expect(icon.textContent).toContain('people');
  });

  it('should apply correct color class', () => {
    component.colorClass = 'success';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const card = compiled.querySelector('mat-card');
    expect(card.classList.contains('success')).toBeTruthy();
  });

  it('should accept string values', () => {
    component.value = 'N/A';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-value').textContent).toContain('N/A');
  });

  it('should accept numeric values', () => {
    component.value = 0;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-value').textContent).toContain('0');
  });

  it('should have default values', () => {
    expect(component.title).toBe('');
    expect(component.value).toBe(0);
    expect(component.subtitle).toBe('');
    expect(component.icon).toBe('info');
    expect(component.colorClass).toBe('primary');
  });
});
