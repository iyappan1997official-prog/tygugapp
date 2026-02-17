import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltHistoryComponent } from './quilt-history.component';

describe('QuiltHistoryComponent', () => {
  let component: QuiltHistoryComponent;
  let fixture: ComponentFixture<QuiltHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
