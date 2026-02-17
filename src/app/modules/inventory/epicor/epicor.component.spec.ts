import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpicorComponent } from './epicor.component';

describe('EpicorComponent', () => {
  let component: EpicorComponent;
  let fixture: ComponentFixture<EpicorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpicorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpicorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
