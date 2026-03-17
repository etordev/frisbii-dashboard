import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ErrorMapperService } from './error-mapper.service';
import type { ApiError } from '../api/api.service';

describe('ErrorMapperService', () => {
  it('maps network error (status 0)', () => {
    TestBed.configureTestingModule({ providers: [ErrorMapperService] });
    const svc = TestBed.inject(ErrorMapperService);
    const err: ApiError = { status: 0, message: 'x' };
    expect(svc.toMessage(err)).toContain('Network error');
  });

  it('maps 404 customer.detail.load to "Customer not found"', () => {
    TestBed.configureTestingModule({ providers: [ErrorMapperService] });
    const svc = TestBed.inject(ErrorMapperService);
    const err: ApiError = { status: 404, message: 'Not found' };
    expect(svc.toMessage(err, 'customer.detail.load')).toBe('Customer not found.');
  });

  it('falls back to api error message for 4xx', () => {
    TestBed.configureTestingModule({ providers: [ErrorMapperService] });
    const svc = TestBed.inject(ErrorMapperService);
    const err: ApiError = { status: 400, message: 'Bad request' };
    expect(svc.toMessage(err)).toBe('Bad request');
  });
});

