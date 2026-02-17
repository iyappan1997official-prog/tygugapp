import { TestBed } from '@angular/core/testing';

import { EditCarrierGuard } from './edit-carrier.guard';

describe('EditCarrierGuard', () => {
  let guard: EditCarrierGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EditCarrierGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
