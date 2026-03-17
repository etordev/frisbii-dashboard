import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, expect, it } from 'vitest';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

describe('ApiService', () => {
  it('GET builds URL with baseUrl and leading slash', () => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://example.test', apiKey: 'x' } },
      ],
    });

    const api = TestBed.inject(ApiService);
    const httpMock = TestBed.inject(HttpTestingController);

    api.get<{ ok: boolean }>('v1/ping').subscribe((res) => {
      expect(res.ok).toBe(true);
    });

    const req = httpMock.expectOne('http://example.test/v1/ping');
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });
    httpMock.verify();
  });
});

