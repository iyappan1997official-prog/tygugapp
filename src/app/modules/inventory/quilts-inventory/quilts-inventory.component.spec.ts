import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltsInventoryComponent } from './quilts-inventory.component';

describe('QuiltsInventoryComponent', () => {
  let component: QuiltsInventoryComponent;
  let fixture: ComponentFixture<QuiltsInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltsInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltsInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
