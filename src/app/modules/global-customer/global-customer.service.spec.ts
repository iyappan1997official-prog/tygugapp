import { TestBed } from '@angular/core/testing';

import { GlobalCustomerService } from './global-customer.service';

describe('GlobalCustomerService', () => {
  let service: GlobalCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
