import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltUsageComponent } from './quilt-usage.component';

describe('QuiltUsageComponent', () => {
  let component: QuiltUsageComponent;
  let fixture: ComponentFixture<QuiltUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltUsageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
