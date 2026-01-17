import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';
import { AnalystDashboardComponent } from './analyst-dashboard/analyst-dashboard.component';
import { Roles } from '../core/enums/roles';


const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: [Roles.ANALYST] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AnalystDashboardComponent
      },
      {
        path: 'credit-requests',
        component: AnalystDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalystRoutingModule { }
