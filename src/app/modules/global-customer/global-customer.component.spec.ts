import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCustomerComponent } from './global-customer.component';

describe('GlobalCustomerComponent', () => {
  let component: GlobalCustomerComponent;
  let fixture: ComponentFixture<GlobalCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
