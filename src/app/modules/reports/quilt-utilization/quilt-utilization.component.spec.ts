import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltUtilizationComponent } from './quilt-utilization.component';

describe('QuiltUtilizationComponent', () => {
  let component: QuiltUtilizationComponent;
  let fixture: ComponentFixture<QuiltUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltUtilizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
