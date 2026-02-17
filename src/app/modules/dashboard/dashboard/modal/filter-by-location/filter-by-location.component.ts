import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { ShipmentsService } from 'src/app/modules/shipments/shipments.service';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-filter-by-location',
  templateUrl: './filter-by-location.component.html',
  styleUrls: ['./filter-by-location.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterByLocationComponent implements OnInit {
  public roleEnum = Roles;
  // @Input() companies: any[] =[];
  @Output() passLocationId: EventEmitter<any> = new EventEmitter()
  private unsubscribe: Subscription[] = [];
  allCustomers: any[] = [];
  locationName: any[] = [];
  quiltsMovementForm: FormGroup;
  allLocations: any[] = [];
  locationId: number[] = [];
  loggedInCustomerId: any[] = [];
  loggedInUserRole: Roles;
  userDetails: any;
  companyRoles: string[] = [this.roleEnum.customerAdmin, this.roleEnum.customerManager]
  private subscriptions: Subscription[] = [];
  constructor(
    public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private getAllLocations: FetchAllLocationsService,
    private shipmentsService: ShipmentsService,
    private toastr: ToastrService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.loggedInCustomerId = this.userDetails?.companyId || "";
    if (this.companyRoles.includes(this.loggedInUserRole)) {
      this.getLocationByCustomerId(this.loggedInCustomerId)
    } else {
      this.fetchAllLocation();
    }
  }

  initForm() {
    this.quiltsMovementForm = this.fb.group({
      searchBy: "",
      checkbox: ""
    })
  }

  fetchAllLocation() {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe((allLocations) => {

      if (allLocations.length || apiCalled) {
        this.allLocations = allLocations;
        this.spinner.hide();
      } else if (!apiCalled) {
        apiCalled = true;
        this.getAllLocations.getAllLocationTypes();


      }
    })
    this.subscriptions.push(getAllLoc);
  }

  getLocationByCustomerId(customerId: any) {
    this.spinner.show()
    const locationDrop = this.shipmentsService.getLocationsByCustomerId(customerId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allLocations = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  toggle(id: number, name: any) {
    if (!this.locationId.includes(id) && !this.locationName.includes(name)) {
      this.locationId.push(id);
      this.locationName.push(name);
    }
    else {
      let selectedIndex = this.locationId.findIndex(locationId => locationId === id);
      this.locationId.splice(selectedIndex, 1);
      let selectedName = this.locationName.findIndex(locationName => locationName === name);
      this.locationName.splice(selectedName, 1);
    }

  }

  applyFilter() {
    const details = { locationId: this.locationId, searchBy: this.quiltsMovementForm.controls.searchBy.value, customerName: this.locationName }
    this.modal.close(details);

  }

  resetFunction() {
    this.quiltsMovementForm.reset();


  }

}
