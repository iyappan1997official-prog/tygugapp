import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashBoardGuard } from './guards/dashboard.guard';

const routes: Routes = [

  {
    path: 'auth',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  // {
  //   path: 'error',
  //   loadChildren: () =>
  //     import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
  //   data: { preload: false }
  // },
  {
    path: '',
    canActivateChild: [DashBoardGuard],
    loadChildren: () =>
      import('../app/modules/layout/layout.module').then((m) => m.LayoutModule),
  },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
