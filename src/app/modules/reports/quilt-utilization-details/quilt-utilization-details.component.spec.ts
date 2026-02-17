import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltUtilizationDetailsComponent } from './quilt-utilization-details.component';

describe('QuiltUtilizationDetailsComponent', () => {
  let component: QuiltUtilizationDetailsComponent;
  let fixture: ComponentFixture<QuiltUtilizationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltUtilizationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltUtilizationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
