import { TestBed } from '@angular/core/testing';

import { FetchCustomerOrderService } from './fetch-customer-order.service';

describe('FetchCustomerOrderService', () => {
  let service: FetchCustomerOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchCustomerOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
