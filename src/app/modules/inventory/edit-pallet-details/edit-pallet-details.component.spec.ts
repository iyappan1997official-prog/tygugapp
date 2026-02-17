import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPalletDetailsComponent } from './edit-pallet-details.component';

describe('EditPalletDetailsComponent', () => {
  let component: EditPalletDetailsComponent;
  let fixture: ComponentFixture<EditPalletDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPalletDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPalletDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
