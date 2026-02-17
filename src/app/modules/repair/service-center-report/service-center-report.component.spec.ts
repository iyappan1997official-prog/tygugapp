import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCenterReportComponent } from './service-center-report.component';

describe('ServiceCenterReportComponent', () => {
  let component: ServiceCenterReportComponent;
  let fixture: ComponentFixture<ServiceCenterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCenterReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCenterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
