import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqsComponent } from './faqs/faqs.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AddFaqModalComponent } from './add-faq-modal/add-faq-modal.component';
import { UserGuideComponent } from './user-guide/user-guide.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { HelpTabComponent } from './help-tab/help-tab.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { AutosizeModule } from 'ngx-autosize';
import { FeedbackComponent } from './feedback/feedback.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SupportTicketComponent } from './support-ticket/support-ticket.component';

const routes: Routes = [
  {
    path: '',
    component: HelpTabComponent
  },
  // {
  //   path: 'user-guide',
  //   component: UserGuideComponent
  // }
]

@NgModule({
  declarations: [
    FaqsComponent,
    AddFaqModalComponent,
    UserGuideComponent,
    HelpTabComponent,
    FeedbackComponent,
    SupportTicketComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    NgbModule,
    NgbCollapseModule,
    MatDividerModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatPaginatorModule,
    ShowErrorModule,
    AutosizeModule
  ]
})
export class HelpModule { }
