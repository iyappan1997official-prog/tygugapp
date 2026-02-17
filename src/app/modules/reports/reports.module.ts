import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportComponent } from './report/report.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LastLocationComponent } from './last-location/last-location.component';
import { CustomerHistoryComponent } from './customer-history/customer-history.component';
import { QuiltHistoryComponent } from './quilt-history/quilt-history.component';
import { QuiltUtilizationComponent } from './quilt-utilization/quilt-utilization.component';
import { ArchivedCustomerComponent } from './archived-customer/archived-customer.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPrintModule } from 'ngx-print';
import { QuiltDetailsComponent } from './quilt-details/quilt-details.component';
import { QuiltUtilizationDetailsComponent } from './quilt-utilization-details/quilt-utilization-details.component';
import { QuiltOnHandComponent } from './quilt-on-hand/quilt-on-hand.component';
import { QuiltInboundComponent } from './quilt-inbound/quilt-inbound.component';
import { QuiltOutboundComponent } from './quilt-outbound/quilt-outbound.component';
import { QuiltUsageComponent } from './quilt-usage/quilt-usage.component';
import { QuiltUsageDetailsComponent } from './quilt-usage-details/quilt-usage-details.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserProfileModalComponent } from './user-profile-modal/user-profile-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ReportComponent
  },
  {
    path: 'last-location',
    component: LastLocationComponent
  },
  {
    path: 'customer-history',
    component: CustomerHistoryComponent
  },
  {
    path: 'quilt-history',
    component: QuiltHistoryComponent
  },
  {
    path: 'quilt-utilization',
    component: QuiltUtilizationComponent
  },
  {
    path: 'archived-customer',
    component: ArchivedCustomerComponent
  },
  {
    path: 'quilt-details',
    component: QuiltDetailsComponent
  },
  {
    path: 'quilt-utilization-details',
    component: QuiltUtilizationDetailsComponent
  },
  {
    path: 'quilt-onHand',
    component: QuiltOnHandComponent
  }, {
    path: 'quilt-inbound',
    component: QuiltInboundComponent
  }, {
    path: 'quilt-outbound',
    component: QuiltOutboundComponent
  },
  {
    path: 'quilt-usage',
    component: QuiltUsageComponent
  },
  {
    path: 'quilt-usage-detail',
    component: QuiltUsageDetailsComponent
  },
  {
    path: 'user-activity',
    component: UserActivityComponent
  }
]

@NgModule({
  declarations: [
    ReportComponent,
    LastLocationComponent,
    CustomerHistoryComponent,
    QuiltHistoryComponent,
    QuiltUtilizationComponent,
    ArchivedCustomerComponent,
    QuiltDetailsComponent,
    QuiltUtilizationDetailsComponent,
    QuiltOnHandComponent,
    QuiltInboundComponent,
    QuiltOutboundComponent,
    QuiltUsageComponent,
    QuiltUsageDetailsComponent,
    UserActivityComponent,
    UserProfileModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    ShowErrorModule,
    MatPaginatorModule,
    NgbCollapseModule,
    NgxPrintModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [
    DatePipe
  ]
})
export class ReportsModule { }
