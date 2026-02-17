import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualInStockComponent } from './individual-in-stock.component';

describe('IndividualInStockComponent', () => {
  let component: IndividualInStockComponent;
  let fixture: ComponentFixture<IndividualInStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndividualInStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualInStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
