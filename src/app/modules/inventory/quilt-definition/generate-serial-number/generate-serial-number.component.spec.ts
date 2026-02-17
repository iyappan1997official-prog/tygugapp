import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSerialNumberComponent } from './generate-serial-number.component';

describe('GenerateSerialNumberComponent', () => {
  let component: GenerateSerialNumberComponent;
  let fixture: ComponentFixture<GenerateSerialNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateSerialNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateSerialNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
