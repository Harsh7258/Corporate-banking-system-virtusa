import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';
import { RoleGuard } from '../core/guards/role.guard';
import { UserTableComponent } from './user-table/user-table.component';
import { Roles } from '../core/enums/roles';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: [Roles.ADMIN] },
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        component: UserTableComponent
      },
      {
        path: 'create-user',
        loadComponent: () => 
          import('./create-user/create-user.component').then(m => m.CreateUserComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }