import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFaqModalComponent } from './add-faq-modal.component';

describe('AddFaqModalComponent', () => {
  let component: AddFaqModalComponent;
  let fixture: ComponentFixture<AddFaqModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddFaqModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFaqModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
