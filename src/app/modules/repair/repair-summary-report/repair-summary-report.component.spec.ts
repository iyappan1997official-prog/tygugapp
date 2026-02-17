import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairSummaryReportComponent } from './repair-summary-report.component';

describe('RepairSummaryReportComponent', () => {
  let component: RepairSummaryReportComponent;
  let fixture: ComponentFixture<RepairSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairSummaryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
