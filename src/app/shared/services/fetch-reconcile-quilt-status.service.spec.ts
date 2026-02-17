import { TestBed } from '@angular/core/testing';

import { FetchReconcileQuiltStatusService } from './fetch-reconcile-quilt-status.service';

describe('FetchReconcileQuiltStatusService', () => {
  let service: FetchReconcileQuiltStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchReconcileQuiltStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
