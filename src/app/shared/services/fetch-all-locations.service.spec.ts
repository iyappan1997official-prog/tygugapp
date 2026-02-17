import { TestBed } from '@angular/core/testing';

import { FetchAllLocationsService } from './fetch-all-locations.service';

describe('FetchAllLocationsService', () => {
  let service: FetchAllLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchAllLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
