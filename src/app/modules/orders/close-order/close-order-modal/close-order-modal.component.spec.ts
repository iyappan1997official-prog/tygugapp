import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseOrderModalComponent } from './close-order-modal.component';

describe('CloseOrderModalComponent', () => {
  let component: CloseOrderModalComponent;
  let fixture: ComponentFixture<CloseOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseOrderModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
