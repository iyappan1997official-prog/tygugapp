import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconsileModalComponent } from './reconsile-modal.component';

describe('ReconsileModalComponent', () => {
  let component: ReconsileModalComponent;
  let fixture: ComponentFixture<ReconsileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReconsileModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconsileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
