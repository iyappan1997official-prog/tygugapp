import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThresholdLimitModalComponent } from './threshold-limit-modal.component';

describe('ThresholdLimitModalComponent', () => {
  let component: ThresholdLimitModalComponent;
  let fixture: ComponentFixture<ThresholdLimitModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThresholdLimitModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThresholdLimitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
