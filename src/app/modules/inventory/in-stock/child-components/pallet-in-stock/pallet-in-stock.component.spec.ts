import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletInStockComponent } from './pallet-in-stock.component';

describe('PalletInStockComponent', () => {
  let component: PalletInStockComponent;
  let fixture: ComponentFixture<PalletInStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PalletInStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletInStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
