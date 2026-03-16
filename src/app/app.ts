import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { CustomerListResponse } from './shared/models/customer.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frisbii-dashboard');

  private readonly api = inject(ApiService);

  ngOnInit(): void {
    // smoke test: verify auth + base URL works. Remove after confirming.
    this.api
      .get<CustomerListResponse>('/v1/list/customer', { params: { size: 10 } })
      .subscribe({
        next: (res) => console.log('Customer list (first 10):', res.content),
        error: (err) => console.error('API smoke test failed:', err),
      });
  }
}
