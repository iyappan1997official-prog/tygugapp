import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeasedComponent } from './leased.component';

describe('LeasedComponent', () => {
  let component: LeasedComponent;
  let fixture: ComponentFixture<LeasedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeasedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
