import { TestBed } from '@angular/core/testing';

import { FetchOrderTypesService } from './fetch-order-types.service';

describe('FetchOrderTypesService', () => {
  let service: FetchOrderTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchOrderTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
