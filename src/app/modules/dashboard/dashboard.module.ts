import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { SidebarModule } from '../sidebar/sidebar.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';
import { LocationDetailsComponent } from './dashboard/modal/location-details/location-details.component';
import { FilterByCompanyComponent } from './dashboard/modal/filter-by-company/filter-by-company.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FilterByLocationComponent } from './dashboard/modal/filter-by-location/filter-by-location.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import {MatSortModule} from '@angular/material/sort';
import { MapLocationComponent } from './dashboard/modal/map-location/map-location.component';
import { ChartModalComponent } from './dashboard/modal/chart-modal/chart-modal.component';
import { ThresholdLimitModalComponent } from './dashboard/modal/threshold-limit-modal/threshold-limit-modal.component';
import { PalletDetailsComponent } from './dashboard/modal/pallet-details/pallet-details.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  //  {
  //   path: 'leased',
  //   component: DashboardComponent
  // },
  // {
  //   path: 'purchased',
  //   component: DashboardComponent
  // }
]
@NgModule({
  declarations: [
    DashboardComponent,
    LocationDetailsComponent,
    FilterByCompanyComponent,
    FilterByLocationComponent,
    MapLocationComponent,
    ChartModalComponent,
    ThresholdLimitModalComponent,
    PalletDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SidebarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatDividerModule,
    SidebarModule,
    MatMenuModule,
    MatTabsModule,
    NgApexchartsModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    NgxTrimDirectiveModule,
    TrimWhiteSpaceModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatCheckboxModule,
    GoogleMapsModule,
    NgbCollapseModule,
    MatSortModule
  ],
  providers: [
  DatePipe
  ],
})
export class DashboardModule { }
