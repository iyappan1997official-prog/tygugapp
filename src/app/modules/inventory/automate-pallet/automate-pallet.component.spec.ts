import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatePalletComponent } from './automate-pallet.component';

describe('AutomatePalletComponent', () => {
  let component: AutomatePalletComponent;
  let fixture: ComponentFixture<AutomatePalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomatePalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomatePalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
