import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from '../reports.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss']
})
export class UserProfileModalComponent implements OnInit {
  private unsubscribe: Subscription[] = [];
  userDetails: any;
  userId: number;
  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService, public modal: NgbActiveModal) { }

  ngOnInit(): void {
    this.getUserDetails(this.userId)
    console.log(this.userDetails);

  }
  getUserDetails(userId: any) {
    this.spinner.show()
    const locationDrop = this.reportService.getUserProfile(userId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.userDetails = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }
}
