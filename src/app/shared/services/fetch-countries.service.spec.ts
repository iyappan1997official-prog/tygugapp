import { TestBed } from '@angular/core/testing';

import { FetchCountriesService } from './fetch-countries.service';

describe('FetchCountriesService', () => {
  let service: FetchCountriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchCountriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
