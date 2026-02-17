import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltUsageDetailsComponent } from './quilt-usage-details.component';

describe('QuiltUsageDetailsComponent', () => {
  let component: QuiltUsageDetailsComponent;
  let fixture: ComponentFixture<QuiltUsageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltUsageDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltUsageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
