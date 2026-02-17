import { TestBed } from '@angular/core/testing';

import { FetchUserRolesService } from './fetch-user-roles.service';

describe('FetchUserRolesService', () => {
  let service: FetchUserRolesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchUserRolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
