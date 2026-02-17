import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterByLocationComponent } from './filter-by-location.component';

describe('FilterByLocationComponent', () => {
  let component: FilterByLocationComponent;
  let fixture: ComponentFixture<FilterByLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterByLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
