import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'list-customer', pathMatch: 'full' },
  {
    path: 'list-customer',
    // Sử dụng lazy loading cho standalone component
    loadComponent: () =>
      import('./pages/list-customer/list-customer.component').then(
        (m) => m.ListCustomerComponent
      ),
  },
  {
    path: 'list-staff',
    loadComponent: () =>
      import('./pages/list-staff/list-staff.component').then(
        (m) => m.ListStaffComponent
      ),
  },
  {
    path: 'post-staff-detail',
    loadComponent: () =>
      import('./pages/post-staff-detail/post-staff-detail.component').then(
        (m) => m.PostStaffDetailComponent
      ),
  },
];
