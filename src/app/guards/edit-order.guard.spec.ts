import { TestBed } from '@angular/core/testing';
import {EditOrderGuard} from './edit-order.guard';

describe('EditOrderGuard', () => {
  let guard: EditOrderGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EditOrderGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
