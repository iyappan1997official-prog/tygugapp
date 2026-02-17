import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltOnHandComponent } from './quilt-on-hand.component';

describe('QuiltOnHandComponent', () => {
  let component: QuiltOnHandComponent;
  let fixture: ComponentFixture<QuiltOnHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltOnHandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltOnHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
