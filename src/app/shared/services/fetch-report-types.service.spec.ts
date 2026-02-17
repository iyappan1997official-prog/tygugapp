import { TestBed } from '@angular/core/testing';

import { FetchReportTypesService } from './fetch-report-types.service';

describe('FetchReportTypesService', () => {
  let service: FetchReportTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchReportTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
