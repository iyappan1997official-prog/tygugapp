import { TestBed } from '@angular/core/testing';

import { FetchPalletStatusService } from './fetch-pallet-status.service';

describe('FetchPalletStatusService', () => {
  let service: FetchPalletStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchPalletStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
