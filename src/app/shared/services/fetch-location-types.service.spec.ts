import { TestBed } from '@angular/core/testing';

import { FetchLocationTypesService } from './fetch-location-types.service';

describe('FetchLocationTypesService', () => {
  let service: FetchLocationTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchLocationTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
