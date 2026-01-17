import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { RouterModule } from '@angular/router';
import { Optional, SkipSelf } from '@angular/core';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthLayoutComponent,
    RouterModule
  ]
})
export class CoreModule { 
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule');
    }
  }
}
