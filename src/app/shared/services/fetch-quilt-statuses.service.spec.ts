import { TestBed } from '@angular/core/testing';

import { FetchQuiltStatusesService } from './fetch-quilt-statuses.service';

describe('FetchQuiltStatusesService', () => {
  let service: FetchQuiltStatusesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchQuiltStatusesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
