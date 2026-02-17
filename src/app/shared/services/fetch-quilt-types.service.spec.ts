import { TestBed } from '@angular/core/testing';

import { FetchQuiltTypesService } from './fetch-quilt-types.service';

describe('FetchQuiltTypesService', () => {
  let service: FetchQuiltTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchQuiltTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
