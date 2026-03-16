import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { CustomersListPageComponent } from './features/customers/pages/customers-list/customers-list-page.component';
import { CustomerDetailPageComponent } from './features/customers/pages/customer-detail/customer-detail-page.component';

export const routes: Routes = [
  { path: '', component: CustomersListPageComponent },
  { path: 'customer/:handle', component: CustomerDetailPageComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' },
];
