import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderNickNameComponent } from './order-nick-name.component';

describe('OrderNickNameComponent', () => {
  let component: OrderNickNameComponent;
  let fixture: ComponentFixture<OrderNickNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderNickNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderNickNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
