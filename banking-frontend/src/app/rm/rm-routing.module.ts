import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';
import { RoleGuard } from '../core/guards/role.guard';
import { RmDashboardComponent } from './rm-dashboard/rm-dashboard.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { CreditRequestsComponent } from './credit-requests/credit-requests.component';
import { Roles } from '../core/enums/roles';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: [Roles.RELATIONSHIP_MANAGER] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: RmDashboardComponent
      },
      {
        path: 'create-client',
        component: CreateClientComponent
      },
      {
        path: 'credit-requests',
        component: CreditRequestsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RmRoutingModule { }