import { TestBed } from '@angular/core/testing';
import { RepairTypeService } from './repair-type.service';

describe('RepairTypeService', () => {
  let service: RepairTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepairTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
