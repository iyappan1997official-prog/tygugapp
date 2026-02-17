import { TestBed } from '@angular/core/testing';

import { FetchShipmentTypesService } from './fetch-shipment-types.service';

describe('FetchShipmentTypesService', () => {
  let service: FetchShipmentTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchShipmentTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
