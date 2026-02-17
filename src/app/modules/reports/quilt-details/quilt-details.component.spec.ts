import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltDetailsComponent } from './quilt-details.component';

describe('QuiltDetailsComponent', () => {
  let component: QuiltDetailsComponent;
  let fixture: ComponentFixture<QuiltDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
