import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalCustomerComponent } from './add-global-customer.component';

describe('AddGlobalCustomerComponent', () => {
  let component: AddGlobalCustomerComponent;
  let fixture: ComponentFixture<AddGlobalCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGlobalCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGlobalCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
