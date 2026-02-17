import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { DashboardService } from '../../dashboard.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from 'src/app/modules/auth/auth.service';

@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LocationDetailsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  quiltsData: any = {};
  userDetails: any;
  searchBy: any;
  quiltSerialNumber: any;
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  constructor(
    public modal: NgbActiveModal,
    private generatePdfService: GeneratePdfService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.getQuiltLookup();
  }

  getQuiltLookup() {
    this.spinner.show();
    const quiltLookup = this.dashboardService.getQuiltsLookup(this.searchBy).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.quiltsData = res.data;
        this.quiltSerialNumber = res.data.quiltSerialNumber;

      }

      else {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(quiltLookup);
  };

  printQrCodes() {

    this.generatePdfService.genrateQuiltQrCode(this.quiltSerialNumber);

  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

}
