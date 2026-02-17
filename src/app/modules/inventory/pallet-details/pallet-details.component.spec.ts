import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletDetailsComponent } from './pallet-details.component';

describe('PalletDetailsComponent', () => {
  let component: PalletDetailsComponent;
  let fixture: ComponentFixture<PalletDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PalletDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
