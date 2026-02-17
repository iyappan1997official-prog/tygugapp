import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltThresholdComponent } from './quilt-threshold.component';

describe('QuiltThresholdComponent', () => {
  let component: QuiltThresholdComponent;
  let fixture: ComponentFixture<QuiltThresholdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltThresholdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltThresholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
