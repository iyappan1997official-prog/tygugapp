import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePalletModalComponent } from './create-pallet-modal.component';

describe('CreatePalletModalComponent', () => {
  let component: CreatePalletModalComponent;
  let fixture: ComponentFixture<CreatePalletModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePalletModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
