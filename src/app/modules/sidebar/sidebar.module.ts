import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToolbarModule } from '../toolbar/toolbar.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    RouterModule
  ],
  exports:[
    SidebarComponent
  ]
})
export class SidebarModule { }
