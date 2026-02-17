import { NgModule } from '@angular/core';
import { LayoutComponent } from './component/layout.component';
import { RouterModule, Routes } from '@angular/router';
import { UserAuthGuard } from '../../guards/user-auth.guard';
import { CustomerAuthGuard } from '../../guards/customer-auth.guard';
import { AddCustomerComponent } from '../customers/add-customer/add-customer.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                // canLoad: [CommonGuard],
                // canActivateChild: [CommonGuard],
                loadChildren: () =>
                    import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
            },
            {
                path: 'users',
                canActivateChild: [UserAuthGuard],
                canLoad: [UserAuthGuard],
                loadChildren: () => import('../users/users.module').then((m) => m.UsersModule)
            },
            {
                path: 'distribution-list',
                loadChildren: () => import('../distribution-list/distribution-list.module').then((m) => m.DistributionListModule)
            },
            {
                path: 'global-customer',
                loadChildren: () => import('../global-customer/global-customer.module').then((m) => m.GlobalCustomerModule)
            },
            {
                path: 'reports',
                loadChildren: () => import('../reports/reports.module').then((m) => m.ReportsModule)
            },
            {
                path: 'shipments',
                loadChildren: () => import('../shipments/shipments.module').then((m) => m.ShipmentsModule)
            },
            {
                path: 'customers',
                canActivateChild: [CustomerAuthGuard],
                canLoad: [CustomerAuthGuard],
                loadChildren: () => import('../customers/customers.module').then((m) => m.CustomersModule)
            },
            {
                path: 'orders',
                canActivateChild: [UserAuthGuard],
                canLoad: [UserAuthGuard],
                loadChildren: () => import('../orders/orders.module').then((m) => m.OrdersModule)
            },
            {
                path: 'location',
                loadChildren: () => import('../location-service/location-service.module').then((m) => m.LocationServiceModule)
            },
            {
                path: 'help',
                loadChildren: () => import('../help/help.module').then((m) => m.HelpModule)
            },
            {
                path: 'profile',
                loadChildren: () => import('../profile/profile.module').then((m) => m.ProfileModule)
            },
            {
                path: 'inventory',
                loadChildren: () => import('../inventory/inventory.module').then((m) => m.InventoryModule)
          },
          {
            path: 'repair',
            loadChildren: () => import('../repair/repair.module').then((m) => m.RepairModule)
          },
            {
                path: '',
                redirectTo: '/dashboard',
                pathMatch: 'full',
            },
            {
                path: '**',
                redirectTo: 'error/404',
            },
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LayoutRoutingModule { }
