import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveallModalComponent } from './receiveall-modal.component';

describe('ReceiveallModalComponent', () => {
  let component: ReceiveallModalComponent;
  let fixture: ComponentFixture<ReceiveallModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiveallModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveallModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
