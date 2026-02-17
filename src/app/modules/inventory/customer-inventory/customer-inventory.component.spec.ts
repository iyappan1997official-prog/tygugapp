import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInventoryComponent } from './customer-inventory.component';

describe('CustomerInventoryComponent', () => {
  let component: CustomerInventoryComponent;
  let fixture: ComponentFixture<CustomerInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
