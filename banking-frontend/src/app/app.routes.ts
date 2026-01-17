import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { Roles } from './core/enums/roles';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'rm',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Roles.RELATIONSHIP_MANAGER] },
    loadChildren: () =>
      import('./rm/rm.module').then(m => m.RmModule)
  },
  {
    path: 'analyst',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Roles.ANALYST] },
    loadChildren: () =>
      import('./analyst/analyst.module').then(m => m.AnalystModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Roles.ADMIN] },      
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];