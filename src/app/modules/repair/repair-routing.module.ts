import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepairSummaryReportComponent } from './repair-summary-report/repair-summary-report.component';
import { RepairReportsComponent } from './repair-reports/repair-reports.component';
import { ServiceCenterReportComponent } from './service-center-report/service-center-report.component';

const routes: Routes = [
  {
    path: 'repair-reports',
    component: RepairReportsComponent
  },
  { path: 'repair-summary-report', component: RepairSummaryReportComponent },
  {
    path: 'service-center-report',
    component: ServiceCenterReportComponent
  }//view page
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairRoutingModule { }



