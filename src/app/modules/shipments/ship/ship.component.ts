import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, debounceTime, forkJoin, of, Subscription } from 'rxjs';
import { ShipmentsService } from '../shipments.service';
import { FetchShipmentETAService } from '../../../shared/services/fetch-shipment-eta.service'
import { FetchShipmentTypesService } from '../../../shared/services/fetch-shipment-types.service'
import { AuthService } from '../../auth/auth.service';
import { InventoryService } from '../../inventory/inventory.service';
import { removeDuplicateSerialNumbers } from 'src/app/shared/ts/remove-duplicate-serial-numbers';
import { HttpErrorResponse } from '@angular/common/http';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { RegexService } from 'src/app/shared/services/regex.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment";
import { ScannerModalComponent } from '../../inventory/scanner-modal/scanner-modal.component';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { ActionPopupComponent } from 'src/app/shared/modules/action-popups/component/action-popup.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { UsersService } from '../../users/users.service';
import { ReportsService } from '../../reports/reports.service';
import { ThresholdLimitModalComponent } from '../../dashboard/dashboard/modal/threshold-limit-modal/threshold-limit-modal.component';
import { DashboardService } from '../../dashboard/dashboard/dashboard.service';
import { GlobalCustomerService } from '../../global-customer/global-customer.service';
import { GenericService } from "../../../shared/services/generic.service";
// import {mouseEvent } from '@agm/core';

@Component({
  selector: 'ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ShipComponent implements OnInit {
  public config: Object = {
    isAuto: true,
    text: { font: '25px serif' }, // Hiden { font: '0px', bottom: 40 },
    frame: { lineWidth: 8 },
    medias: {
      audio: true,
      video: {
        facingMode: 'environment', // To require the rear camera https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
  };
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  newQuilts: any[] = [];
  newPallets: any[] = [];
  detailsBySerialNumber: FormControl = new FormControl("");
  // detailsBySerialNumber: FormControl = new FormControl("", [Validators.pattern(this.regexService.palletQuiltSerial)])
  // public output: any = this.detailsBySerialNumber.value;
  customerFilterId: FormControl = new FormControl(0, [Validators.required]);
  // companyFilterId: FormControl = new FormControl(0, [Validators.required]);
  allCompanyModels: any[] = [];
  allCustomerModels: any[] = [];
  allOrdersModels: any[] = [];
  output: any[] = [];
  orderId: number;
  orderTypeId: number;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  addShipForm: FormGroup;
  allShipmentETA: any[] = [];
  allShipmentTypes: any[] = [];
  allCarriers: any[] = [];
  userId: number;
  isFreightForwarder: boolean;
  orderDisplay: boolean = true;
  // palletArr: any[] = [];
  allDestinations: any[] = [];
  loggedInUserRole: Roles;
  userDetails: any;
  palletSerialNumber: any[] = [];
  theCustomerId: number = 0
  searchText: string = undefined;
  searchText1: string = undefined;
  searchText2: string = undefined;
  searchText3: string = undefined;

  arrowErrorShow: boolean = false;
  shipErrorShow: boolean = false;
  assignPopup: boolean = false;
  isassignValue: boolean = false
  totalQuilts: number = 0;
  ignoreConfirm: boolean = false;
  internalShip: boolean = false;
  custGroupId: number;
  thresholdDetail: any[] = [];
  returnCustomer: boolean = false;
  isLoading: boolean = false;
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  mapZoom = 12;
  mapMarker: google.maps.Marker;
  mapCenter: google.maps.LatLng;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
  };

  markerInfoContent = '';
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  address: string;
  formattedAddress?: string | null = null;
  locationCoords?: google.maps.LatLng | null = null;
  bounds: google.maps.LatLngBounds;

  googleDistanceService = new google.maps.DistanceMatrixService();
  origin1 = new google.maps.LatLng(55.930385, -3.118425);
  origin2 = new google.maps.LatLng(50.087692, 14.421150);
  destinationA = 'Stockholm, Sweden';
  destinationB = 'Greenwich, England';

  matrixOption = {
    origin: [this.origin1, this.origin2],
    destination: [this.destinationA, this.destinationB],
    travelMode: 'Driving',
    unitSystem: google.maps.UnitSystem.IMPERIAL
  };


  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }


  get formValues(): any {
    return this.addShipForm.getRawValue();
  }

  get items$() {
    return this._items$.asObservable();
  }
  constructor(
    private fb: FormBuilder,
    private shipmentsService: ShipmentsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private fetchShipmentETAService: FetchShipmentETAService,
    private inventoryService: InventoryService,
    private fetchShipmentTypesService: FetchShipmentTypesService,
    private regexService: RegexService,
    private reportService: ReportsService,
    private modalService: NgbModal,
    private usersService: UsersService,
    private dashboardService: DashboardService,
    private customerGroupService: GlobalCustomerService,
    private genericService: GenericService
  ) { }

  ngOnInit(): void {
    debugger;
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0];
    this.userId = this.userDetails?.custGroupId || 0; // previously sending CompanyId
    this.isFreightForwarder = this.userDetails?.isFreightForwarder
    this.custGroupId = this.userDetails?.custGroupId || 0;

    this.initForm();
    this.fetchData();
    this.distanceCalc();
  }

  distanceCalc() {
    this.googleDistanceService.getDistanceMatrix({
      origins: [this.origin1, this.origin2],
      destinations: [this.destinationA, this.destinationB],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL
    }, (res, status) => {
      if (status == 'OK') {
        var origins = res.originAddresses;
        var destinations = res.destinationAddresses;

        for (var i = 0; i < origins.length; i++) {
          var results = res.rows[i].elements;
          for (var j = 0; j < results.length; j++) {
            var element = results[j];
            var distance = element.distance.text;
            var duration = element.duration.text;
            var from = origins[i];
            var to = destinations[j];
          }
        }
      }
    })
  }


  public onError(e: any): void {
    alert(e);
  }

  public handle(action: any, fn: string): void {
    console.log(action, fn, this.output)
    action[fn]().subscribe();
  }

  openScannerModal() {
    const modalRef = this.modalService.open(ScannerModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })
    modalRef.result.then((result) => {
      console.log(result)
      this.output = result.output;
      // this.output.length = result.output.length - 1;
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output);
      // }
      this.spinner.show();

      // let commaSeperatedValues = new Array();
      // commaSeperatedValues = this.detailsBySerialNumber.value.split(',');
      const detailBySerialNumber = this.returnCustomer ? this.inventoryService.getCustomerBySerialNumber(this.output) : this.inventoryService.getQuiltPalletDetailsBySerialNumber(this.output);
      const addQuiltPallet = detailBySerialNumber.subscribe(res => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.detailsBySerialNumber.reset();
          this.addShipForm.markAsDirty();
          let customerId = res?.data[0]?.customerId;
          if (this.returnCustomer) {
            this.getCarrierByCustomerId(customerId);
            this.getLocationByCustomerId(customerId, 2);
          }
          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              if (!this.newQuilts.some(x => x.id === quilt.id)) {
                this.newQuilts.push(quilt);
                this.totalQuilts++;
              }
              if (quilt.assignedToCustomer === false) {
                this.assignPopup = true;
              }
            } else {
              if (!this.newPallets.some(x => x.id === quilt.id)) {
                this.newPallets.push(quilt);
                this.palletSerialNumber.push(quilt.serialNumber);
                if (quilt.assignedToCustomer === false) {
                  this.assignPopup = true;
                }
                this.totalQuilts += quilt.totalQuilts
              }
            }
          });
        } else {
          if (res.message) {
            this.toastr.error(res.message)
          }
        }
      })
      this.unsubscribe.push(addQuiltPallet);
      this.detailsBySerialNumber.patchValue("");
    })
  }

  roleControl() {
    if (this.tab === "ship") {
      this.calltheApis();
    }
  }
  findAddress($event: MatSelectChange) {
    this.shipmentsService.getLocationDetailsById($event.source.value).subscribe(
      response => {
        if (response.statusCode === 200) {
          const location = response.data;
          const point: google.maps.LatLngLiteral = {
            lat: location.latitude,
            lng: location.longitude,
          };

          this.locationCoords = new google.maps.LatLng(point);
          this.map.panTo(point);

          // this.markerOptions = {
          //   draggable: false,
          //   animation: google.maps.Animation.DROP,
          // };
          this.mapCenter = new google.maps.LatLng(point);
          this.cd.detectChanges();

          //this.mapMarker.setPosition(this.locationCoords);
          let address: string = '';

          address = `${location.address} ${location.city}`;
          if (location.state && location.state != '') {
            address = `${address} ${location.state}`;
          }
          if (location.country && location.country != '') {
            address = `${address} ${location.country}`;
          }
          this.address = address;
          this.formattedAddress = address;
          this.markerInfoContent = address;

        } else {
          this.toastr.error(response.error_message, response.status);
        }

      }
    );
  }
  fetchData() {
    let fetchData = [
      this.genericService.getAllShipmentTypes().pipe(catchError(error => of(error))),
      this.genericService.getAllShipmentETAs().pipe(catchError(error => of(error)))
    ]
    if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      fetchData.push(this.customerGroupService.GetAllCustomerGroupsForGlobalAdmin().pipe(catchError(error => of(error))), of(null), of(null))
    }
    else if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      fetchData.push(this.customerGroupService.GetAllCustomerGroups().pipe(catchError(error => of(error))), of(null), of(null))
    }
    else if (this.loggedInUserRole === this.roleEnum.customerAdmin || this.loggedInUserRole === this.roleEnum.customerManager) {
      fetchData.push(
        of(null),
        this.shipmentsService.carrierByCustomerGroupId(+this.custGroupId).pipe(catchError(error => of(error))),
        this.shipmentsService.getLocationsForCompanyUserByCustomerGroupId(+this.custGroupId).pipe(catchError(error => of(error)))
      )
    } else if ([this.roleEnum.masterAdmin, this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      fetchData.push(this.customerGroupService.GetAllCustomerGroups().pipe(catchError(error => of(error))),
        this.shipmentsService.carrierByCustomerGroupId(0).pipe(catchError(error => of(error))),
        of(null)
      )
    }

    this.isLoading = true;
    forkJoin(fetchData).subscribe({
      next: (results) => {
        console.log(results)
        if (results[0]) {
          if (results[0].statusCode === 200) {
            this.allShipmentTypes = results[0]?.data;
          }
          else {
            this.allShipmentTypes = [];
            if (results[0].message) {
              this.toastr.error(results[0].message);
            }
          }
        }
        if (results[1]) {
          if (results[1].statusCode === 200) {
            this.allShipmentETA = results[1].data;
          }
          else {
            this.allShipmentETA = [];
            if (results[1].message) {
              this.toastr.error(results[1].message);
            }
          }
        }
        if (results[2]) {
          if (results[2].statusCode === 200) {
            this.allCustomerModels = results[2].data;
          }
          else {
            this.allCustomerModels = [];
            if (results[2].message) {
              this.toastr.error(results[2].message);
            }
          }
        }
        if (results[3]) {
          if (results[3].statusCode === 200) {
            this.allCarriers = results[3].data;
          }
          else {
            this.allCarriers = [];
            if (results[3].message) {
              this.toastr.error(results[3].message);
            }
          }
        }
        if (results[4]) {
          if (results[4].statusCode === 200) {
            this.allDestinations = results[4].data;
          }
          else {
            this.allCustomerModels = [];
            if (results[4].message) {
              this.toastr.error(results[4].message);
            }
          }
        }
      },
      error: (e: any) => { this.toastr.error(e.message); },
      complete: () => { this.isLoading = false; this.cd.detectChanges(); }
    });

  }
  calltheApis() {
    this.fetchShipmentTypes();
    if (this.loggedInUserRole === this.roleEnum.customerAdmin || this.loggedInUserRole === this.roleEnum.customerManager) {
      this.getCarrierByCustomerGroupId(this.custGroupId);
      this.getLocationsForCompanyUserByCustomerGroupId(this.custGroupId);
      this.orderDisplay = false;
    }
    else if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.getCustomerGruops();

    } else if ([this.roleEnum.masterAdmin, this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.getCustomerGruops();
      this.getCarrierByCustomerGroupId(0);
    }
    else if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.getCustomerGruops()
    }
    // else {
    //   this.getCarrierByCustomerId(0);
    //   // this.updatedropdowns();
    // }

    this.patchCustomerId();
    this.cd.detectChanges();
  }

  initForm() {
    this.addShipForm = this.fb.group({
      id: 0,
      orderId: [0, [Validators.required]],
      customerGroupId: [0, [Validators.required]],
      shipmentTypeId: ['', [Validators.required]],
      locationId: ['', [Validators.required]],
      shipmentETAId: 1,
      carrierId: null,
      proNumber: [''],
      carrierName: [''],
      additionalNotes: '',
      shipmentNumber: [''],
      shippingDate: [''],
      airWayBillNo: [''],
      ignoreInvalidQuilts: false,
      confirmAssignShip: false,
      confirmCustomerAssign: false
    })

    this.patchCustomerId();
  }

  patchCustomerId() {
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      const { customerGroupId, orderId } = this.addShipForm.controls;
      customerGroupId.patchValue(this.custGroupId);
      orderId.clearValidators();
      orderId.updateValueAndValidity();
      this.customerFilterId.clearValidators();
      this.customerFilterId.updateValueAndValidity();
      // this.companyFilterId.clearValidators();
      // this.companyFilterId.updateValueAndValidity();
    }
  }

  // getCompanyName() {
  //   this.spinner.show()
  //   const companyNames = this.shipmentsService.getCompaniesForShip().subscribe((res) => {
  //     this.spinner.hide();
  //     if (res.statusCode === 200) {
  //       this.allCompanyModels = res?.data;
  //     } else if (res.message) {
  //       this.toastr.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(companyNames);
  // }

  // getCustomerByCompany(id: any) {
  //   this.spinner.show()
  //   const customerNames = this.shipmentsService.getCustomerByCompanyId(id).subscribe((res) => {
  //     this.spinner.hide();
  //     if (res.statusCode === 200) {
  //       this.allCustomerModels = res?.data;
  //     } else if (res.message) {
  //       this.toastr.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(customerNames);
  // }
  getCustomerGruops() {
    debugger
    this.spinner.show();
    let apiCalled = false;
    if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.customerGroupService.GetAllCustomerGroupsForGlobalAdmin().subscribe((res) => {
        this.spinner.hide();
        console.log(this.allCustomerModels = res?.data, 'globaladmin')
        this.allCustomerModels = res?.data
      })

    } else {
      const customersSub = this.customerGroupService.GetAllCustomerGroups().subscribe((res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.allCustomerModels = res?.data;
        } else if (res.message) {
          this.toastr.error(res.message)
        }
      })
      this.unsubscribe.push(customersSub);
    }
  }
  fetchAllCustGroups() {
    this.spinner.show();
    let apiCalled = false;
    const customersSub = this.reportService.getCustomersByGroup(+this.custGroupId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomerModels = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(customersSub);
  }

  getOrdersByCustomerGroupId(cid: any) {
    this.spinner.show()
    const orderNames = this.shipmentsService.getOrderByCustomerGroupId(cid).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allOrdersModels = res?.data;
        this.getCarrierByCustomerGroupId(cid)
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(orderNames);
  }

  // updateCompanyFilters(value: any) {
  //   this.addShipForm.controls.orderId.reset(0);
  //   this.addShipForm.controls.locationId.reset('');
  //   this.customerFilterId.reset(0)
  //   if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
  //     this.getCustomers()
  //   } else if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
  //     this.fetchAllCustGroups()
  //   } else {
  //     this.getCustomerByCompany(value);
  //   }
  // }

  locationForService(value: any) {
    this.spinner.show();
    const locationSub = this.usersService.GetLocationsByLocationTypeId(value).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.allDestinations = res?.data
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }

  updateCustomerFilters(value: any) {
    if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.getLocationByCustomerGroupId(value, 0);
      this.getCarrierByCustomerGroupId(value);
      this.custGroupId = value;
      const { orderId } = this.addShipForm.controls;
      orderId.clearValidators();
      orderId.updateValueAndValidity();
    } else if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.getCarrierByCustomerGroupId(value);
      // this.getLocationsForCompanyUser(value);
      this.getLocationByCustomerGroupId(value, 2);

    } else {
      this.addShipForm.controls.orderId.reset(0);
      this.addShipForm.controls.locationId.reset('');
      this.getOrdersByCustomerGroupId(value)
      this.getLocation(value);
      // this.getCarrierByCustomerId(value);
    }
  }

  updateOrderFilters(value: any) {
    let order = this.allOrdersModels.find(x => x.id == value);
    this.orderId = order.id;
    this.orderTypeId = this.allOrdersModels.find(x => x.id == value).orderType.id;
    /*
    if (!!value) {
      // CHANGED: Retrieve the Customer ID from the form controls
      const currentCustomerId = this.addShipForm.controls['customerGroupId'].value;

      // Pass the Customer ID instead of order.id
      this.getLocation(currentCustomerId);
    } */
  }

  /*
  updateOrderFilters(value: any) {
    let order = this.allOrdersModels.find(x => x.id == value);
    this.orderId = order.id;
    this.orderTypeId = this.allOrdersModels.find(x => x.id == value).orderType.id;
    if (!!value) {
      this.getLocation(order.id);
    }
  }
  */
  palletNumberTags() {
    this.arrowErrorShow = true;
    if (!!this.detailsBySerialNumber.value) {
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output);
      // }
      this.arrowErrorShow = false;
      this.shipErrorShow = false;
      this.spinner.show();

      let commaSeperatedValues = new Array();
      commaSeperatedValues = this.detailsBySerialNumber.value.split(',');
      const detailBySerialNumber = this.returnCustomer ? this.inventoryService.getCustomerBySerialNumber(commaSeperatedValues) : this.inventoryService.getQuiltPalletDetailsBySerialNumber(commaSeperatedValues);
      const addQuiltPallet = detailBySerialNumber.subscribe(res => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          debugger
          this.detailsBySerialNumber.reset();
          this.addShipForm.markAsDirty();
          // let customerGroupId=res?.data[0]?.customerGroupId;
          let customerId = res?.data[0]?.customerId;
          if (this.returnCustomer) {
            this.getCarrierByCustomerId(customerId);
            this.getLocationByCustomerId(customerId, 2);
          }
          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              if (!this.newQuilts.some(x => x.id === quilt.id)) {
                this.newQuilts.push(quilt);
                this.totalQuilts++;
              }

              if (quilt.assignedToCustomer === false) {
                this.assignPopup = true;
              }
            } else {
              if (!this.newPallets.some(x => x.id === quilt.id)) {
                this.newPallets.push(quilt);
                this.palletSerialNumber.push(quilt.serialNumber);
                if (quilt.assignedToCustomer === false) {
                  this.assignPopup = true;
                }
                this.totalQuilts += quilt.totalQuilts
              }
            }
          });
        } else {

          if (res.message) {
            this.toastr.error(res.message)
          }
        }
      })
      this.unsubscribe.push(addQuiltPallet);
    }
  }

  openModalPopup(message: string, data: any[], errors: any, isSuccess: boolean) {
    const modalRef = this.modalService.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = isSuccess ? 'Success' : 'Invalid';
    modalRef.componentInstance.body = message;
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.confirmBtnText = "Ok";
    modalRef.componentInstance.data = data;
    modalRef.componentInstance.errorDetails = errors;
    modalRef.componentInstance.isSuccess = isSuccess;
    modalRef.result
      .then(() => {
        if (isSuccess) {
          this.roleControl();
          // this.router.navigate(['/shipments/track-shipments'], { queryParams: { tab: "view-shipment" } });
        }
      })
      .catch((res) => {
      });
  }

  openConfirmationModal(body: string, summeryText: string, data: any, id: number) {
    const modalRef = this.modalService.open(ConfirmActionComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Confirmation';
    modalRef.componentInstance.body = body;
    modalRef.componentInstance.summeryText = summeryText;
    modalRef.componentInstance.data = data;
    modalRef.componentInstance.confirmBtnText = 'Continue';
    modalRef.result
      .then(() => {

        // if (id==3) {
        //   this.addShipForm.controls.IgnoreInvalidQuilts.patchValue(true);
        //     this.addShipment();
        // }
        switch (id) {
          case 1:
            this.addShipForm.controls.confirmAssignShip.patchValue(true);
            this.addShipment();
            break;
          case 2:
            this.addShipForm.controls.confirmCustomerAssign.patchValue(true);
            this.addShipment();
            break;
          case 3:
            this.addShipForm.controls.ignoreInvalidQuilts.patchValue(true);
            this.addShipment();
            break;
          default:
            break;
        }
        //this.addShipment();
      })
      .catch((res) => { this.ignoreConfirm = false; });
  }

  getCustomers() {
    this.spinner.show()
    const customerDrop = this.shipmentsService.getConsignedCustomers().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomerModels = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(customerDrop);

  }

  getCarrier(orderNo: any) {
    this.spinner.show();
    const carrierReset = this.addShipForm.controls.carrierId as FormControl;
    carrierReset.reset();
    const carrierDrop = this.shipmentsService.carrierByOrderNumber(orderNo).subscribe((res) => {
      if (res.statusCode === 200) {
        this.allCarriers = res?.data;
        // this.getLocation(orderNo);
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(carrierDrop);
  }
  getLocation(customerId: any) { // Changed parameter from orderId to customerId
    this.spinner.show();
    const locationReset = this.addShipForm.controls.locationId as FormControl;
    locationReset.reset();

    // CHANGED: Now calling GetLocationsByCustomerGroupCustomer with customerId
    const locationDrop = this.shipmentsService.GetLocationsByCustomerGroupCustomer(customerId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allDestinations = res?.data;
        // Keep existing logic to auto-select if orderTypeId is 3
        if (this.orderTypeId == 3 && this.allDestinations.length > 0) {
          locationReset.patchValue(res?.data[0].id);
        }
      } else if (res.message) {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(locationDrop);
  }


  /*
  getLocation(orderId: any) {
    this.spinner.show()
    const locationReset = this.addShipForm.controls.locationId as FormControl;
    locationReset.reset();
    const locationDrop = this.shipmentsService.GetLocationsByOrderId(orderId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allDestinations = res?.data;
        if (this.orderTypeId == 3) {
          locationReset.patchValue(res?.data[0].id)
        }
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }*/
  getCarrierByCustomerGroupId(customerGroupId: any) {
    this.spinner.show();
    const carrierDrop = this.shipmentsService.carrierByCustomerGroupId(customerGroupId).subscribe((res) => {
      if (res.statusCode === 200) {
        this.allCarriers = res?.data;
        this.spinner.hide();
      } else if (res.message) {
        this.toastr.error(res.message)
        this.spinner.hide();
      }
    })
    this.unsubscribe.push(carrierDrop);
  }
  getCarrierByCustomerId(customerId: any) {
    this.spinner.show();
    const carrierDrop = this.shipmentsService.carrierByCustomerId(customerId).subscribe((res) => {
      if (res.statusCode === 200) {
        this.allCarriers = res?.data;
        this.spinner.hide();
      } else if (res.message) {
        this.toastr.error(res.message)
        this.spinner.hide();
      }
    })
    this.unsubscribe.push(carrierDrop);
  }

  getLocationByCustomerId(customerId: any, locationTypeId?: any) {
    this.spinner.show()
    const locationDrop = this.shipmentsService.getLocationsByCustomerId(customerId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allDestinations = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  getLocationByCustomerGroupId(customerGroupId: any, locationTypeId?: any) {
    this.spinner.show()
    const locationDrop = this.usersService.getLocationsByCustomerId(customerGroupId, locationTypeId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allDestinations = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  getLocationsForCompanyUserByCustomerGroupId(customerGroupId: any) {
    this.spinner.show();
    const locationDrop = this.shipmentsService.getLocationsForCompanyUserByCustomerGroupId(customerGroupId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allDestinations = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }
  // getLocationsForCompanyUser(customerId: any) {
  //   this.spinner.show()

  //   const locationDrop = this.shipmentsService.getLocationsForCompanyUser(customerId).subscribe((res) => {
  //     this.spinner.hide();
  //     if (res.statusCode === 200) {
  //       this.allDestinations = res?.data;
  //     } else if (res.message) {
  //       this.toastr.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(locationDrop);
  // }

  mapCarrierName(carrier: any) {
    this.addShipForm.controls.carrierName.patchValue(carrier.name);
  }
  selectRows(checked: boolean) {
    if (checked) {
      this.returnCustomer = true;
      this.allDestinations = [];
    } else {
      this.returnCustomer = false;
      this.getLocationsForCompanyUserByCustomerGroupId(this.userId);
    }
  }
  removeSerialNumber(array: any[], index: number, indexParentArray?: number, palletId?: number) {
    if (!array.length && indexParentArray != undefined) {
      this.newPallets.splice(indexParentArray, 1);
      this.palletSerialNumber.splice(indexParentArray, 1);
    } else if ((indexParentArray != undefined) && (this.newPallets[indexParentArray].id === palletId) && array.length) {
      this.newPallets[indexParentArray].quilts.forEach((item: any) => {
        this.newQuilts.push(item);
      });
      this.newPallets.splice(indexParentArray, 1);
      this.palletSerialNumber.splice(indexParentArray, 1);
    }
    // else if (this.newPallets[index].id === palletId) {
    //   this.newPallets.splice(index, 1);
    //   ;
    // }
    if (array[index].totalQuilts) {
      this.totalQuilts = this.totalQuilts - array[index].totalQuilts;
    } else {
      this.totalQuilts--
    }
    array.splice(index, 1);
    this.palletSerialNumber.splice(index, 1);
    this.addShipForm.markAsDirty();
  }

  addShipment() {
    this.spinner.show();
    if (this.roleEnum.consignAdmin && !this.orderId) {
      this.orderId = 0;
    }

    // --- FIX: Convert empty strings to null for nullable fields ---
    const formValues = { ...this.formValues };

    // Convert empty strings to null for nullable backend fields
    if (formValues.shipmentETAId === "") {
      formValues.shipmentETAId = 1;
    }
    if (formValues.carrierId === "") {
      formValues.carrierId = null;
    }
    if (formValues.carrierName === "") {
      formValues.carrierName = null;
    }
    if (formValues.additionalNotes === "") {
      formValues.additionalNotes = null;
    }
    if (formValues.proNumber === "") {
      formValues.proNumber = null;
    }
    if (formValues.shipmentNumber === "") {
      formValues.shipmentNumber = null;
    }
    if (formValues.airWayBillNo === "") {
      formValues.airWayBillNo = null;
    }

    const body: any = {
      ...formValues, // Use the cleaned formValues instead of this.formValues
      inventories: removeDuplicateSerialNumbers(this.newQuilts, this.newPallets, this.palletSerialNumber),
      orderId: this.orderId,
      customerGroupId: (this.loggedInUserRole === this.roleEnum.customerAdmin || this.loggedInUserRole === this.roleEnum.customerManager) ? this.custGroupId : this.custGroupId
    }

    console.log('Sending payload:', body);

    const addShipForm = this.shipmentsService.addShipment(body).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.newPallets = [];
        this.newQuilts = [];
        this.palletSerialNumber = [];
        this.totalQuilts = 0;
        this.addShipForm.reset({ id: 0, customerId: 0 }, { emitEvent: false });
        this.customerFilterId.reset(0);
        this.initForm();
        this.ignoreConfirm = false;
        this.spinner.hide();
        this.openModalPopup(res.message, res?.data, res?.error?.errorDetails, true);
        if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
          this.getThresholdCompare()
        }
      } else {
        this.spinner.hide();
        if (res?.message && res?.errorType == 'Popup') {
          this.ignoreConfirm = false;
          this.openModalPopup(res?.message, res?.data, res?.error?.errorDetails, false)
        } else if (res?.message && res?.errorType == 'Confirm') {
          this.openConfirmationModal(res?.message, 'Please confirm if you want to continue?', res?.errorDetails, res?.id);
        }
        else if (res?.message) {
          this.toastr.error(res.message);
        }
      }
    }
      , (err: any) => {
        this.spinner.hide();

        if (err?.error?.message && err?.error?.errorType == 'Popup') {
          this.openModalPopup(err?.error?.message, err?.error?.data, err?.error?.errorDetails, false)
        }
        else if (err?.error?.message && err?.error?.errorType == 'Confirm') {
          this.openConfirmationModal(err?.error?.message, 'Please confirm if you want to continue?', err?.error?.errorDetails, err?.error?.id);
        }
      }
    );
    this.unsubscribe.push(addShipForm);
  }


  /* 
  addShipment() {

    this.spinner.show();
    if (this.roleEnum.consignAdmin && !this.orderId) {
      this.orderId = 0;
    }
    // --- START OF FIX ---

    // Get the raw form values
    const formVals = this.formValues;

    // 1. Coerce empty strings "" to null so the .NET binder is happy
    if (formVals.shipmentETAId === "") {
      formVals.shipmentETAId = null;
    }
    if (formVals.carrierId === "") {
      formVals.carrierId = null;
    }

    // 2. Ensure number fields are numbers, not strings
    const customerGroupIdFromForm = Number(formVals.customerGroupId) || 0;
    const orderIdFromForm = Number(formVals.orderId) || 0;

    // --- END OF FIX ---

    const body: any = {
      ...this.formValues,
      inventories: removeDuplicateSerialNumbers(this.newQuilts, this.newPallets, this.palletSerialNumber),
      orderId: this.orderId,
      customerGroupId: (this.loggedInUserRole === this.roleEnum.customerAdmin || this.loggedInUserRole === this.roleEnum.customerManager) ? this.custGroupId : this.custGroupId
    }

    //body.ignoreInvalidQuilts = this.ignoreConfirm;
    console.log(body);

    const addShipForm = this.shipmentsService.addShipment(body).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.newPallets = [];
        this.newQuilts = [];
        this.palletSerialNumber = [];
        this.totalQuilts = 0;
        this.addShipForm.reset({ id: 0, customerId: 0 }, { emitEvent: false });
        this.customerFilterId.reset(0);
        // this.companyFilterId.reset(0);
        // this.addShipForm.controls.customerId.reset('');
        this.initForm();
        this.ignoreConfirm = false;
        this.spinner.hide();
        this.openModalPopup(res.message, res?.data, res?.error?.errorDetails, true);
        if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
          this.getThresholdCompare()
        }
      } else {
        this.spinner.hide();
        if (res?.message && res?.errorType == 'Popup') {
          this.ignoreConfirm = false;
          this.openModalPopup(res?.message, res?.data, res?.error?.errorDetails, false)
        } else if (res?.message && res?.errorType == 'Confirm') {
          //this.ignoreConfirm = true;
          this.openConfirmationModal(res?.message, 'Please confirm if you want to continue?', res?.errorDetails, res?.id);
        }
        else if (res?.message) {
          this.toastr.error(res.message);
        }
      }
    }
      , (err: any) => {
        this.spinner.hide();

        if (err?.error?.message && err?.error?.errorType == 'Popup') {
          this.openModalPopup(err?.error?.message, err?.error?.data, err?.error?.errorDetails, false)
        }
        else if (err?.error?.message && err?.error?.errorType == 'Confirm') {
          // this.ignoreConfirm = true;
          this.openConfirmationModal(err?.error?.message, 'Please confirm if you want to continue?', err?.error?.errorDetails, err?.error?.id);
        }
      }
    );
    this.unsubscribe.push(addShipForm);
   } */

  openThreholdModal(obj: any) {
    const modalRef = this.modalService.open(ThresholdLimitModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.thresholdQuantity = obj.thresholdQuantity
    modalRef.componentInstance.locationName = obj.locationName
    modalRef.componentInstance.partNumber = obj.partNumber
    modalRef.componentInstance.thresholdId = obj.thresholdId
    modalRef.componentInstance.customerFacingDescription = obj.customerFacingDescription
    modalRef.result.then((result) => {
      if (result.requestAccept == true || result.requestReject == true) {
        let accepted: boolean = false;
        if (result.requestAccept) { accepted = true }
        this.acceptedRequest(result.thresholdId, accepted)
      }
    }
    )
  }

  acceptedRequest(id: any, isAccepted: boolean) {
    this.spinner.show();
    const quiltsMovLoc = this.dashboardService.requestedOrder(id, isAccepted).subscribe((res) => {
      if (res.statusCode == 200) {
        console.log('mail send!');

        this.spinner.hide();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(quiltsMovLoc);

  }

  getThresholdCompare() {
    this.spinner.show();
    const customerListSub = this.dashboardService.getThresholdByCustomerId(this.userId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.thresholdDetail = res.data
        if (this.thresholdDetail) {
          for (let obj of this.thresholdDetail) {
            if ((obj.thresholdValue > 0) && (obj.thresholdValue >= obj.quiltQuantity)) {
              if (!obj.isAccepted) {
                this.openThreholdModal(obj);
              } else if (obj.isProcessed) {
                this.openThreholdModal(obj);
              }
            }
          }
        }
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(customerListSub);

  }
  addOrder() {
    const addShipFormForm = this.addShipForm;
    console.log(addShipFormForm);

    if (!this.addShipForm.controls['shippingDate'].value) {
      this.addShipForm.controls['shippingDate'] = new FormControl((new Date()));
    }
    if (addShipFormForm.invalid || (!this.newPallets.length && !this.newQuilts.length)) {
      addShipFormForm.markAllAsTouched();
      addShipFormForm.markAsDirty();
      this.shipErrorShow = true;
      this.arrowErrorShow = false;
    } else if (!this.addShipForm.pristine) {

      // this.shipErrorShow = false;
      // if ((this.assignPopup) && (this.loggedInUserRole === this.roleEnum.masterAdmin || this.loggedInUserRole === this.roleEnum.warehouseUser)) {
      //   this.openConfirmationModal('Some Quilts are not assigned to customer. Are you sure you want to assign and ship?',null,null);
      // }
      // else if (this.isassignValue && (this.loggedInUserRole === this.roleEnum.consignAdmin)) {
      //   this.openConfirmationModal()
      // } 
      //else {
      this.addShipment();
      //}
    }
  }

  shipTypeSelect(id: any) {
    this.addShipForm.controls.locationId.reset('');
    this.addShipForm.controls.orderId.reset(0);
    this.addShipForm.controls.carrierId.reset('');
    this.addShipForm.controls.shipmentETAId.reset('');
    this.addShipForm.controls.customerGroupId.reset(0);
    this.customerFilterId.reset()
    // this.companyFilterId.reset()

    if ([4].includes(id)) {
      this.internalShip = true;
      this.locationForService(4);
      this.getCarrierByCustomerGroupId(0);
      const { orderId } = this.addShipForm.controls;
      orderId.clearValidators();
      orderId.updateValueAndValidity();
      // this.companyFilterId.clearValidators();
      // this.companyFilterId.updateValueAndValidity();
      this.addShipForm.controls.confirmAssignShip.patchValue(true);
    } else {
      this.internalShip = false;
    }
  }

  // getLocationsByRegion(id: number) {
  //   this.spinner.show();
  //   const locationSub = this.usersService.getLocationByRegion(+id).subscribe(res => {
  //     this.spinner.hide();
  //     if (res.statusCode == 200) {
  //       this.allDestinations = res?.data
  //     } else if (res.message) {
  //       this.toastr.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(locationSub);
  // }

  fetchShipmentTypes() {
    let apiCalled = false;
    const allShipTypesOption = this.fetchShipmentTypesService.allShipmentTypes.subscribe((status) => {
      if (status.length || apiCalled) {
        this.allShipmentTypes = status;
        this.fetchShipmentETA();
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchShipmentTypesService.getAllShipmentTypes()
      }
    })
    this.unsubscribe.push(allShipTypesOption);
  }

  fetchShipmentETA() {
    let apiCalled = false;
    const allShipETAOption = this.fetchShipmentETAService.allShipmentETAs.subscribe((status) => {
      if (status.length || apiCalled) {
        this.allShipmentETA = status;
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchShipmentETAService.getAllShipmentETAs()
      }
    })
    this.unsubscribe.push(allShipETAOption);
  }

  // mapClicked($event: google.maps.MouseEvent): void {
  //   this.markers.push({
  //     lat: this.markers[0].lat,
  //     lng: this.markers[0].lng,
  //     draggable: true
  //     // lat: $event.latLng.lat(),
  //     // lng: $event.latLng.lng(),
  //     // draggable: true
  //   });
  // }
  // markerDragEnd(m: marker, $event: google.maps.MouseEvent) {
  //   console.log('dragEnd', m, $event);
  // }
  // markers: marker[] = [
  //   {
  //     lat: 51.673858,
  //     lng: 7.815982,
  //     label: 'A',
  //     draggable: true
  //   },
  //   {
  //     lat: 51.373858,
  //     lng: 7.215982,
  //     label: 'B',
  //     draggable: false
  //   },
  //   {
  //     lat: 51.723858,
  //     lng: 7.895982,
  //     label: 'C',
  //     draggable: true
  //   }
  // ]

}
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
