import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveStockComponent } from './inactive-stock.component';

describe('InactiveStockComponent', () => {
  let component: InactiveStockComponent;
  let fixture: ComponentFixture<InactiveStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactiveStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
