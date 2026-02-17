import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltInboundComponent } from './quilt-inbound.component';

describe('QuiltInboundComponent', () => {
  let component: QuiltInboundComponent;
  let fixture: ComponentFixture<QuiltInboundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltInboundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltInboundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
