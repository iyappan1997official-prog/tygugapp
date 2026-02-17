import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTableRowComponent } from './add-table-row.component';

describe('AddTableRowComponent', () => {
  let component: AddTableRowComponent;
  let fixture: ComponentFixture<AddTableRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTableRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
