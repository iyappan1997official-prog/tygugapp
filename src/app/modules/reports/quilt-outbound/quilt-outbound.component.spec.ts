import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltOutboundComponent } from './quilt-outbound.component';

describe('QuiltOutboundComponent', () => {
  let component: QuiltOutboundComponent;
  let fixture: ComponentFixture<QuiltOutboundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltOutboundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltOutboundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
