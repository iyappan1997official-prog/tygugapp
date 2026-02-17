import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerModalComponent } from './scanner-modal.component';

describe('ScannerModalComponent', () => {
  let component: ScannerModalComponent;
  let fixture: ComponentFixture<ScannerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScannerModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
