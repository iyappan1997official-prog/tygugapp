import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RepairRoutingModule } from './repair-routing.module';
import { RepairSummaryReportComponent } from './repair-summary-report/repair-summary-report.component';

// ✅ Import your shared module here
import { SharedModule } from '../../shared/shared.module';
import { RepairReportsComponent } from './repair-reports/repair-reports.component';
import { ServiceCenterReportComponent } from '../repair/service-center-report/service-center-report.component';

@NgModule({
  declarations: [
    ServiceCenterReportComponent,
    RepairSummaryReportComponent,
    RepairReportsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatPaginatorModule,
    RepairRoutingModule,
    SharedModule   
  ]
})
export class RepairModule { }
