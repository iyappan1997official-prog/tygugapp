import { TestBed } from '@angular/core/testing';

import { FetchCustomersService } from './fetch-customers.service';

describe('FetchCustomersService', () => {
  let service: FetchCustomersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchCustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
