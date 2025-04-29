import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [LoginGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./chat/chat.component').then((m) => m.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'chat/:id',
    loadComponent: () =>
      import('./chat/chat.component').then((m) => m.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./history/history.component').then((m) => m.HistoryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
