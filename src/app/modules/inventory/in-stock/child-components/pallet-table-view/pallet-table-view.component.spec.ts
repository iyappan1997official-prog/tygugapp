import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletTableViewComponent } from './pallet-table-view.component';

describe('PalletTableViewComponent', () => {
  let component: PalletTableViewComponent;
  let fixture: ComponentFixture<PalletTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PalletTableViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
