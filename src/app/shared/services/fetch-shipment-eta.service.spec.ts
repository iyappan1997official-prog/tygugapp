import { TestBed } from '@angular/core/testing';

import { FetchShipmentETAService } from './fetch-shipment-eta.service';

describe('FetchShipmentETAService', () => {
  let service: FetchShipmentETAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchShipmentETAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
