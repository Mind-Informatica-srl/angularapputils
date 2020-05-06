import { TestBed } from '@angular/core/testing';

import { AngularAppUtilsLibService } from './angular-app-utils-lib.service';

describe('AngularAppUtilsLibService', () => {
  let service: AngularAppUtilsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularAppUtilsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
