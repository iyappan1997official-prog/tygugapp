import { TestBed } from '@angular/core/testing';

import { FetchOrderStatusService } from './fetch-order-status.service';

describe('FetchOrderStatusService', () => {
  let service: FetchOrderStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchOrderStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
