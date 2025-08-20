import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/customer/components/chat/chat.component';
import { RegisterComponent } from './core/register/register/register.component';
import { UnauthorizeComponent } from './core/pages/error-page/unauthorize/unauthorize.component';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'error/403-unauthorized',
    component: UnauthorizeComponent,
  },
];
