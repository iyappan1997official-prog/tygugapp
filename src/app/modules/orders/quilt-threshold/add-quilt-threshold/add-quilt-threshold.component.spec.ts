import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuiltThresholdComponent } from './add-quilt-threshold.component';

describe('AddQuiltThresholdComponent', () => {
  let component: AddQuiltThresholdComponent;
  let fixture: ComponentFixture<AddQuiltThresholdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddQuiltThresholdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQuiltThresholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
