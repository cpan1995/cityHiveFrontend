import { TestBed } from '@angular/core/testing';

import { SmsService } from './sms.service';

describe('SmsServiceService', () => {
  let service: SmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
