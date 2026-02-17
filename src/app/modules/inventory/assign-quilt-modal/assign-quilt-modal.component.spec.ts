import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignQuiltModalComponent } from './assign-quilt-modal.component';

describe('AssignQuiltModalComponent', () => {
  let component: AssignQuiltModalComponent;
  let fixture: ComponentFixture<AssignQuiltModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignQuiltModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignQuiltModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
