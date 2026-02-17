import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastLocationComponent } from './last-location.component';

describe('LastLocationComponent', () => {
  let component: LastLocationComponent;
  let fixture: ComponentFixture<LastLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
