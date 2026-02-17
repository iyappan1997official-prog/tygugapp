import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddUsersComponent } from './add-users/add-users.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { AddUserComponent } from './add-user/add-user.component';
import { ChangePasswordPopupComponent } from './change-password-popup/change-password-popup.component';


const routes: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: 'add-user',
    component: AddUserComponent,
    data: {
      componentAccessFor: "add-user"
    }
  },
  {
    path: 'edit-user/:id',
    component: AddUserComponent,
    data: {
      componentAccessFor: "edit-user"
    }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
  {
    path: 'change-password-popup',
    component: ChangePasswordPopupComponent
  }
]

@NgModule({
  declarations: [
    UsersComponent,
    AddUsersComponent,
    AddUserComponent,
    ChangePasswordPopupComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ShowErrorModule,
    MatPaginatorModule,
    MatButtonModule,
    MatMenuModule,
    NgxTrimDirectiveModule,
    TrimWhiteSpaceModule
  ]
})
export class UsersModule { }
