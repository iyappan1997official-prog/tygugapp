import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairReportsComponent } from './repair-reports.component';

describe('RepairReportsComponent', () => {
  let component: RepairReportsComponent;
  let fixture: ComponentFixture<RepairReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
