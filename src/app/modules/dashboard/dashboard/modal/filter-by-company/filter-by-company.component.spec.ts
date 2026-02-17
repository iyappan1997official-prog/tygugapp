import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterByCompanyComponent } from './filter-by-company.component';

describe('FilterByCompanyComponent', () => {
  let component: FilterByCompanyComponent;
  let fixture: ComponentFixture<FilterByCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterByCompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterByCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
