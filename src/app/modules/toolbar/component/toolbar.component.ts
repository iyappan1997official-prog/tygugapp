import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthModel } from '../../auth/models/auth.model';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent implements OnInit {
  userDetails: any = {};
  loggedInAsUser:boolean=false;
  masterUserDetails:any;
  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private cd:ChangeDetectorRef,
    private ngbModal: NgbModal
  ) { }

  ngOnInit(): void {
    this.authService.currentUserSubject.subscribe(value => {
      if (value?.data) {
        this.userDetails = value?.data;
      } else {
        this.userDetails = this.authService?.getUserFromLocalStorage()?.data;
      }
    })
    this.authService.masterUserSubject.subscribe(value=>{
      this.loggedInAsUser=false;
      if(value?.data && value?.data.roles.includes(Roles.masterAdmin)){
        this.masterUserDetails=value;
        this.loggedInAsUser=true;
      }else{
        let masterUserDetails= localStorage.getItem("masterUserDetails");
        if(masterUserDetails){
        this.masterUserDetails= JSON.parse(localStorage.getItem("masterUserDetails"));
            if(this.masterUserDetails && this.masterUserDetails.data && this.masterUserDetails.data.roles.includes(Roles.masterAdmin)){
              this.loggedInAsUser=true;
            }
        }
      }
    })
    
    this.cd.detectChanges();
  }

  confirmLogoutFromUser(){
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })
    modalRef.componentInstance.body=`Are you sure you want to exit from user account ?`;
    modalRef.componentInstance.title='Exit from User Account';
    modalRef.componentInstance.cancelBtnText="No";
    modalRef.result.then(() => {
      this.logoutFromUser();
    }).catch((res) => { })
  }
  logoutFromUser(){    
    if(this.masterUserDetails && this.masterUserDetails.data && this.loggedInAsUser){
      this.spinner.show("spinner2");
      let userDetails=this.masterUserDetails.data;
      let token=this.masterUserDetails.data.token;
      let auth = new AuthModel();
        auth.token = token;
      localStorage.setItem("masterUserDetails", "");
      localStorage.setItem("masterUserToken", "");
      this.authService.setAuthFromLocalStorage(auth);
      this.authService.setUserFromLocalStorage(this.masterUserDetails);
      this.authService.currentUserSubject.next(this.masterUserDetails);
      this.authService.masterUserSubject.next("");
      this.spinner.hide("spinner2");
      if(this.router.url.indexOf('dashboard')>-1){
        window.location.reload();
      }else{      
     this.router.navigate(['/dashboard']);
      }
      // this.router.navigate(["/dashboard"]);
    }
  }
  logoutUser() {
    this.authService.logout();
  }

  navigateToProfile() {
    this.router.navigate(["/profile"])
  }
}
