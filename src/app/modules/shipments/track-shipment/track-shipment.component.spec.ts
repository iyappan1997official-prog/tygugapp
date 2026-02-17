import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackShipmentComponent } from './track-shipment.component';

describe('TrackShipmentComponent', () => {
  let component: TrackShipmentComponent;
  let fixture: ComponentFixture<TrackShipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackShipmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
