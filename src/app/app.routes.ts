import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';

export const routes: Routes = [
  // TODO: point this to CustomersListPageComponent when the page exists.
  { path: '', component: NotFoundComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' },
];
