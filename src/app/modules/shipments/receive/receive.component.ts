import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FetchOrderStatusService } from 'src/app/shared/services/fetch-order-status.service';
import { InventoryService } from '../../inventory/inventory.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { removeDuplicateSerialNumbers } from "../../../shared/ts/remove-duplicate-serial-numbers";
import { AuthService } from '../../auth/auth.service';
import { ScannerModalComponent } from '../../inventory/scanner-modal/scanner-modal.component';
import { ActionPopupComponent } from 'src/app/shared/modules/action-popups/component/action-popup.component'
import { error } from 'console';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { MatDialog } from '@angular/material/dialog';
import { ReceiveallModalComponent } from '../receiveall-modal/receiveall-modal.component';


@Component({
  selector: 'receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiveComponent implements OnInit, OnDestroy {
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
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  allStatus: any[] = [];
  receiveQuiltsForm: FormGroup;
  detailsBySerialNumber: FormControl = new FormControl("");
  // public output: any = this.detailsBySerialNumber.value;
  output: any[] = [];
  newQuilts: any[] = [];
  newPallets: any[] = [];
  palletSerialNumber: any[] = [];
  count: number = 0;
  dataOfSerial: any;
  dataOfSerial1: any;
  newSerialNumber: any[] = [];
  newSerialNUmber1: any[] = [];
  loggedInUserRole: Roles;
  userDetails: any;
  onlyQuiltAllowed: boolean = false
  arrowErrorShow: boolean = false;
  shipErrorShow: boolean = false;
  ignoreConfirm: boolean = false;
  invalidQuilt: boolean = false;
  masterUsers: boolean = false;
  isReceiveAndCreatePallet: boolean = false;
  finalErrorMessage: string;
  constructor(
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private toastrService: ToastrService,
    private orderStatusService: FetchOrderStatusService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0];
    if(this.loggedInUserRole===Roles.masterAdmin || this.loggedInUserRole===Roles.serviceManager){
      this.masterUsers=true;
    }
    this.initform();

    if (this.tab === "receive") {
      this.fetchOrderStatus();
    }
  }

  initform() {
    this.receiveQuiltsForm = this.fb.group({
      customerId: [0],
      customerName: [""],
      orderId: [0],
      orderNumber: [""],
      orderStatusId: [""],
      sendEmail: false,
      ignoreInvalidQuilts: false,
      receiveAndCreatePallet: false,
      mockPalletId: [0]
    });
  }

  public onError(e: any): void {
    alert(e);
  }

  public handle(action: any, fn: string): void {
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
      this.output = result.output;
      // this.output.length = result.output.length - 1;
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output)
      // }
      this.spinner.show();

      // let commaSeperatedValues = new Array();
      // commaSeperatedValues = this.detailsBySerialNumber.value.split(",");

      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(this.output, true).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          this.receiveQuiltsForm.markAsDirty();
          let isMockPallet = res?.data[0].isMockPallet;
          if (isMockPallet) {
            this.receiveQuiltsForm.controls.mockPalletId.patchValue(res?.data[0].id);
            this.openAlertModal('This is a mock pallet. Please scan quilts to receive in this pallet.');
          }
          if ((this.newQuilts && this.newQuilts.length && this.newQuilts.length > 0) || (this.newPallets && this.newPallets.length && this.newPallets.length > 0)) {
            if ((this.newQuilts.length > 0 && this.newQuilts[0].customerId === res?.data[0].customerId) || (this.newPallets.length > 0 && this.newPallets[0]?.customerId === res?.data[0].customerId)) {
              this.assignDataToArrays(res?.data);
              this.dataOfSerial1 = res?.data;
              // this.dataOfSerial,
              if (!this.receiveQuiltsForm.controls.mockPalletId.value || this.receiveQuiltsForm.controls.mockPalletId.value == 0) {
                this.dataOfSerial.forEach((quilt: any) => {
                  this.newSerialNumber.push(quilt.serialNumber);
                })
              }
            } else {
              this.toastrService.error("Customer is different from existing customer's Quilts/Pallets.")
            }
          } else {
            this.assignDataToArrays(res?.data);
            this.dataOfSerial = res?.data;
            //  this.dataOfSerial,
            if (!this.receiveQuiltsForm.controls.mockPalletId.value || this.receiveQuiltsForm.controls.mockPalletId.value == 0) {
              this.dataOfSerial.forEach((quilt: any) => {
                this.newSerialNumber.push(quilt.serialNumber);
              })
            }
          }
        } else {
          if (res.message) {
            this.toastrService.error(res.message)
          }
        }
      })
      this.unsubscribe.push(detailsBySerialNumberSub);

      // this.getDetailsBySerialNumber()
      this.detailsBySerialNumber.patchValue("")
    });
  }

  removeSerialNumber(array: any[], index: number, indexParentArray?: number) {
    // this.receiveQuiltsForm.reset();
    // this.receiveQuiltsForm.clearValidators();
    array.splice(index, 1);
    this.count = 0;
    if (!array.length && indexParentArray != undefined) {
      this.newPallets.splice(indexParentArray, 1);
      // this.count = 0;
    }
    if (indexParentArray != undefined) {
      // this.receiveQuiltsForm.reset();
      this.newPallets.forEach((quilt: any) => {
        quilt.quilts.forEach((item: any) => {
          this.newQuilts.push(item);
          this.newPallets.splice(indexParentArray, 1);
        })
      });
      // this.count =0;
    }
    if (this.newQuilts.length > 0 && !this.newPallets.length) {
      this.onlyQuiltAllowed = true;
    } else {
      this.onlyQuiltAllowed = false
    }
    this.receiveQuiltsForm.markAsDirty();
  }

  resetForm() {
    this.receiveQuiltsForm.reset();
    this.newQuilts = [];
    this.newPallets = [];
    this.palletSerialNumber = [];
    this.detailsBySerialNumber.reset();
    this.count = 0;
  }

  fetchOrderStatus() {
    let apiCalled = false;
    const orderStatusOption = this.orderStatusService.orderStatus.subscribe((status) => {
      if (status.length || apiCalled) {
        this.allStatus = status;
      } else if (!apiCalled) {
        apiCalled = true;
        this.orderStatusService.getAllStatus()
      }
    })
    this.unsubscribe.push(orderStatusOption);
  }

  getDetailsBySerialNumber() {
    this.arrowErrorShow = true;
    if (!!this.detailsBySerialNumber.value) {
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output);
      // }
      this.arrowErrorShow = false;
      this.shipErrorShow = false;
      this.spinner.show();

      let commaSeperatedValues = new Array();
      commaSeperatedValues = this.detailsBySerialNumber.value.split(",");

      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(commaSeperatedValues, true).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {

          localStorage.setItem('GetQuiltPalletDetailsBySerialNumber', JSON.stringify(res));
          // console.log(localStorage.getItem('custIdForLocation')); 

          this.receiveQuiltsForm.markAsDirty();
          let isMockPallet = res?.data[0].isMockPallet;
          if (isMockPallet) {
            this.receiveQuiltsForm.controls.mockPalletId.patchValue(res?.data[0].id);
            this.openAlertModal('This is a mock pallet. Please scan quilts to receive in this pallet.');
          }

          if ((this.newQuilts && this.newQuilts.length && this.newQuilts.length > 0) || (this.newPallets && this.newPallets.length && this.newPallets.length > 0)) {
            if ((this.newQuilts.length > 0 && this.newQuilts[0].customerId === res?.data[0].customerId) || (this.newPallets.length > 0 && this.newPallets[0]?.customerId === res?.data[0].customerId)) {
              this.assignDataToArrays(res?.data);
              this.dataOfSerial1 = res?.data;
              // this.dataOfSerial,
              if (this.newQuilts.length > 0 && !this.newPallets.length) {
                this.onlyQuiltAllowed = true;
              } else {
                this.onlyQuiltAllowed = false
              }
              if (!this.receiveQuiltsForm.controls.mockPalletId.value || this.receiveQuiltsForm.controls.mockPalletId.value == 0) {
                this.dataOfSerial.forEach((quilt: any) => {
                  this.newSerialNumber.push(quilt.serialNumber);
                })
              }
            } else {
              this.toastrService.error("Customer is different from existing customer's Quilts/Pallets.")
            }
          } else {
            this.assignDataToArrays(res?.data);
            this.dataOfSerial = res?.data;
            if (this.newQuilts.length > 0 && !this.newPallets.length) {
              this.onlyQuiltAllowed = true;
            } else {
              this.onlyQuiltAllowed = false
            }
            //  this.dataOfSerial,
            if (!this.receiveQuiltsForm.controls.mockPalletId.value || this.receiveQuiltsForm.controls.mockPalletId.value == 0) {
              this.dataOfSerial.forEach((quilt: any) => {
                this.newSerialNumber.push(quilt.serialNumber);
              })
            }
          }
        } else {
          if (res.message) {
            this.toastrService.error(res.message)
          }
        }
      })
      this.unsubscribe.push(detailsBySerialNumberSub);
    }
  }

  assignDataToArrays(data: any) {
    this.detailsBySerialNumber.reset();
    this.receiveQuiltsForm.patchValue(data[0]);

    data?.forEach((quilt: any) => {
      if (this.receiveQuiltsForm.controls.mockPalletId.value > 0 && this.newPallets.length > 0) {
        this.newPallets[0].quilts.push(quilt);
      } else {
        if (quilt.quilts === null) {
          if (!this.newQuilts.some(x => x.id === quilt.id))
            this.newQuilts.push(quilt);
        } else {
          if (!this.newPallets.some(x => x.id === quilt.id)) {
            this.newPallets.push(quilt);
            this.palletSerialNumber.push(quilt.serialNumber);
          }
        }
      }
    });
  }

  receivePallet() {
    this.count++;
    const receiveQuiltsForm = this.receiveQuiltsForm;
    if (receiveQuiltsForm.invalid || (!this.newQuilts.length && !this.newPallets.length)) {
      receiveQuiltsForm.markAllAsTouched();
      receiveQuiltsForm.markAsDirty();
      this.shipErrorShow = true;
      this.arrowErrorShow = false;
    } else if (!receiveQuiltsForm.pristine) {
      this.shipErrorShow = false;
      this.isReceiveAndCreatePallet = true;
      if (this.count < 2) {
        //this.receiveQuiltsForm.controls.receiveAndCreatePallet.patchValue(true)
        // this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(true)
        this.receiveQuiltsForm.controls.sendEmail.patchValue(false)
        this.callReceiveQuiltsApi()
      }
      else {
        this.newSerialNumber.includes(this.newSerialNumber)
        //this.receiveQuiltsForm.controls.receiveAndCreatePallet.patchValue(true)
        // this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(true)
        this.receiveQuiltsForm.controls.sendEmail.patchValue(true);
        this.callReceiveQuiltsApi();
      }
    }
  }

  receiveQuilts() {
    this.count++;
    const receiveQuiltsForm = this.receiveQuiltsForm;
    //this.receiveQuiltsForm.controls.receiveAndCreatePallet.patchValue(false);
    //this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(false);
    if (receiveQuiltsForm.invalid || (!this.newQuilts.length && !this.newPallets.length)) {
      receiveQuiltsForm.markAllAsTouched();
      receiveQuiltsForm.markAsDirty();
      this.shipErrorShow = true;
      this.arrowErrorShow = false;
    } else if (!receiveQuiltsForm.pristine) {
      this.isReceiveAndCreatePallet = false;
      this.shipErrorShow = false;
      if (this.count < 2) {
        this.receiveQuiltsForm.controls.sendEmail.patchValue(false)
        this.callReceiveQuiltsApi()
      }
      else {
        this.newSerialNumber.includes(this.newSerialNumber)
        this.receiveQuiltsForm.controls.sendEmail.patchValue(true);
        this.callReceiveQuiltsApi();
      }
    }
  }

  callReceiveQuiltsApi() {
    // this.count;
    // this.count++;
    // console.log(this.count);
    this.spinner.show();
    const body: any = {
      ...this.receiveQuiltsForm.getRawValue(),
      inventories: this.receiveQuiltsForm.controls.mockPalletId.value > 0 ? removeDuplicateSerialNumbers(this.newPallets[0].quilts, null, null) : removeDuplicateSerialNumbers(this.newQuilts, this.newPallets, this.palletSerialNumber)
    };

    body.ignoreInvalidQuilts = this.ignoreConfirm;
    body.receiveAndCreatePallet = this.isReceiveAndCreatePallet;
    const receiveQuiltSub = this.inventoryService.receiveShipment(body).subscribe((res: any) => {
debugger
      if(res?.errorType == 'Confirm' && res?.id == 1){
        const dialogRef = this.dialog.open(ReceiveallModalComponent, {
          width: '500px',
          disableClose: true,
        });
        this.resetForm();
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          
        });
        // this.resetForm();
      }

      if (res.statusCode === 200 || res.statusCode === 201) {
        this.spinner.hide();
        // this.receiveQuiltsForm.reset();
        // this.resetForm();
        // this.router.navigate(['/shipments/track-shipments'], { queryParams: { tab: "view-shipment" } });
        if (res?.message) {
          this.openActionModal(res.message, res.data);
        }
      } else {
        this.spinner.hide();
        let errorMessage;
        if (res?.message && res?.errorType == 'Popup') {
          this.ignoreConfirm = false;

          // this.isReceiveAndCreatePallet = false;
          let typeOfMessage: any[] = []
          res?.data.map((item: any) => {
            if (item.receiveShipmentErrorType !== 'IncorrectInventoryStatus') {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,
                palletArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Pallet'
                  ).map((obj: any) => obj.serialNumber),
                quiltArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Quilt'
                  ).map((obj: any) => obj.serialNumber),
                inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              });
            } else {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,

                palletArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Pallet' && obj.inventoryStatus)
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                quiltArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Quilt' && obj.inventoryStatus) // Filter by both inventoryType and inventoryStatus
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                inventoryStatusArr: Array.from(new Set(item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)))
                // inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              })
            }
          });
          const finalMessage = this.errorMessageConcat(typeOfMessage)
          this.openErrorModal(res?.message, finalMessage.split('/n'))
          typeOfMessage = []
          this.newQuilts = [];
          this.newPallets = [];
          this.newSerialNumber = [];
          this.resetForm();
        } else if (res?.message && res?.errorType == 'Confirm') {
          this.ignoreConfirm = true;
          // this.isReceiveAndCreatePallet = false;
          let typeOfMessage: any[] = []
          res?.data.map((item: any) => {
            if (item.receiveShipmentErrorType !== 'IncorrectInventoryStatus') {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,
                palletArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Pallet'
                  ).map((obj: any) => obj.serialNumber),
                quiltArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Quilt'
                  ).map((obj: any) => obj.serialNumber),
                inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              });
            } else {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,

                palletArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Pallet' && obj.inventoryStatus)
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                quiltArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Quilt' && obj.inventoryStatus) // Filter by both inventoryType and inventoryStatus
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                inventoryStatusArr: Array.from(new Set(item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)))
                // inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              })
            }
          });
          const finalMessage = this.errorMessageConcat(typeOfMessage)
          this.openErrorModal(res?.message, finalMessage.split('/n'))
          typeOfMessage = []
          //this.newQuilts = [];
          // this.newPallets = [];
          // this.newSerialNumber = [];
          // this.resetForm();
        }
      }
    }
      , (err: any) => {
        debugger
        this.spinner.hide();
        if (err?.error?.message && err?.error?.errorType == 'Popup') {
          this.ignoreConfirm = false;
          if(!err?.error?.data || err?.error?.data==null){
            this.openErrorModal(err?.error?.message, null);
          }
          if (this.isReceiveAndCreatePallet) {
            this.openErrorModal(err?.error?.message, null)
          } else {
            this.isReceiveAndCreatePallet = false;
          }

          let typeOfMessage: any[] = []
          err?.error?.data.map((item: any) => {
            if (item.receiveShipmentErrorType !== 'IncorrectInventoryStatus') {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,
                palletArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Pallet'
                  ).map((obj: any) => obj.serialNumber),
                quiltArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Quilt'
                  ).map((obj: any) => obj.serialNumber),
                inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              });
            } else {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,

                palletArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Pallet' && obj.inventoryStatus)
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                quiltArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Quilt' && obj.inventoryStatus) // Filter by both inventoryType and inventoryStatus
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, {}),
                inventoryStatusArr: Array.from(new Set(item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)))
                // inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              })
            }
          });
          const finalMessage = this.errorMessageConcat(typeOfMessage)
          this.openErrorModal(err?.error?.message, finalMessage.split('/n'))
          typeOfMessage = []
          this.newQuilts = [];
          this.newPallets = [];
          this.newSerialNumber = [];
          this.resetForm();
        } else if (err?.error?.message && err?.error?.errorType == 'Confirm') {
          this.ignoreConfirm = true;
          // this.openErrorModal(err?.error?.message, err?.error?.data)
          if (this.isReceiveAndCreatePallet) {
            this.openErrorModal(err?.error?.message, null)
          } else {
            this.isReceiveAndCreatePallet = false;
          }
          let typeOfMessage: any[] = [];
          err?.error?.data.map((item: any) => {
            if (item.receiveShipmentErrorType !== 'IncorrectInventoryStatus') {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,
                palletArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Pallet'
                  ).map((obj: any) => obj.serialNumber),
                quiltArr: item.receiveShipmentErrorModels.
                  filter
                  (
                    (obj: any) => obj.inventoryType === 'Quilt'
                  ).map((obj: any) => obj.serialNumber),
                inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              });
            } else {
              typeOfMessage.push({
                type: item.receiveShipmentErrorType,

                palletArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Pallet' && obj.inventoryStatus)
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, []),
                quiltArr: item.receiveShipmentErrorModels
                  .filter((obj: any) => obj.inventoryType === 'Quilt' && obj.inventoryStatus) // Filter by both inventoryType and inventoryStatus
                  .reduce((acc: any, obj: any) => {
                    acc[obj.inventoryStatus] = acc[obj.inventoryStatus] || [];
                    acc[obj.inventoryStatus].push(obj.serialNumber);
                    return acc;
                  }, []),
                inventoryStatusArr: Array.from(new Set(item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)))
                // inventoryStatusArr: item.receiveShipmentErrorModels.filter((obj: any) => obj.inventoryStatus).map((obj: any) => obj.inventoryStatus)
              })
            }
          });
          const finalMessage =  this.errorMessageConcat(typeOfMessage)
          this.openErrorModal( err?.error?.message, finalMessage.split('\n'));
          // typeOfMessage = [];
          // this.newQuilts = [];
          // this.newPallets = [];
          // this.newSerialNumber = [];
          //this.resetForm();
        }
      }
    );
    this.unsubscribe.push(receiveQuiltSub);
  }

  errorMessageConcat(errTypeArr: any[]) {
    let IncorrectSerialNumberMessage = '';
    let IncorrectOrderMappingMessage = '';
    let IncorrectInventoryStatusMessage = '';
    let ConsignedLocationErrorMessage = '';
    let ReceiveErrorMessage = '';
    let IncorrectPartNumberMessage = '';
    let SameLocationMessage = '';
    let errortype: string = '';
    let subText: any[] = [];
    let addedText: any[] = [];

    for (let errType of errTypeArr) {
      debugger
      if (Object.keys(errType.quiltArr).length > 0 && Object.keys(errType.palletArr).length > 0) {
        errortype = 'Quilt/Pallet'
      } else if (Object.keys(errType.palletArr).length > 0) {
        errortype = errortype.length > 0 && errortype == 'Quilt' ? 'Quilt/Pallet' : 'Pallet'
      } else {
        errortype = errortype.length > 0 && errortype == 'Pallet' ? 'Quilt/Pallet' : 'Quilt'
      }
      if (errType.inventoryStatusArr.length == 0) {
        if (errType.type == 'IncorrectSerialNumber') {
          IncorrectSerialNumberMessage = `The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} cannot be received as these have invalid serialnumber./n`
        }
        if (errType.type == 'IncorrectOrderMapping') {
          IncorrectOrderMappingMessage = `The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} cannot be received for this customer at this time due to belonging to a different customer or a different order./n`
        }
        if (errType.type == 'ConsignedLocationError') {
          ConsignedLocationErrorMessage = ` The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} cannot be received as autoshipments are not allowed through consigned location./n`
        }
        if (errType.type == 'ReceiveError') {
          ReceiveErrorMessage = `The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} cannot be received due to some technical error at backend./n`
        }
        if (errType.type == 'IncorrectPartNumber') {
          IncorrectPartNumberMessage = `The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} cannot be received as these does not belongs to correct part number./n`
        }
        if (errType.type == 'SameLocationAsDestination') {
          SameLocationMessage = `The scanned ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr.join(', ')} and pallets ${errType.palletArr.join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr.join(', ')}` : `pallets ${errType.palletArr.join(', ')}`} is already present in your inventory./n`
        }
      } else {
        errType.inventoryStatusArr.map((item: any) => {
          if (errType.type == 'IncorrectInventoryStatus') {
            const mainText = `You are not allowed to receive the following inventory due to incorrect status./n`
            addedText[item] = `The ${errortype == 'Quilt/Pallet' ? `quilts ${errType.quiltArr[item].join(', ')} and pallets ${errType.palletArr[item].join(', ')}` : errortype == 'Quilt' ? `quilts ${errType.quiltArr[item].join(', ')}` : `pallets ${errType.palletArr[item].join(', ')}`} has ${item} status./n`
            subText.push(addedText[item])
            IncorrectInventoryStatusMessage = mainText + subText;
          }
        })
      }
    }
    return IncorrectSerialNumberMessage + IncorrectOrderMappingMessage + IncorrectInventoryStatusMessage + ConsignedLocationErrorMessage + ReceiveErrorMessage + IncorrectPartNumberMessage + SameLocationMessage;
  }

  openActionModal(msg: string, data: any) {
    const modalRef = this.modalService.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Awesome';
    modalRef.componentInstance.body = msg;
    modalRef.componentInstance.confirmBtnText = 'Ok';
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.isSuccess = true

    modalRef.result
      .then(() => {
        this.ignoreConfirm = false;
        this.isReceiveAndCreatePallet = false;
        if (data) {
          this.newQuilts = this.newQuilts.filter(e => {
            return data.some((item: any) => item === e.serialNumber);
          });
          this.newPallets = this.newPallets.filter(e => {
            return data.some((item: any) => item === e.serialNumber);
          });
          this.detailsBySerialNumber.reset();
        } else {
          this.newQuilts = [];
          this.newPallets = [];
          this.newSerialNumber = [];
          this.resetForm();
        } this.cd.detectChanges();
        // this.receiveQuiltsForm.controls.ignoreConfirm.patchValue(false);
        // this.receiveQuiltsForm.controls.isReceiveAndCreatePallet.patchValue(false);
        //this.router.navigate(['/shipments/track-shipments'], { queryParams: { tab: "view-shipment" } });
      })
      .catch((res) => {
      });
  }

  openErrorModal(message: any, data: any[]) {
    const modalRef = this.modalService.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Invalid';
    modalRef.componentInstance.body = message;
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.confirmBtnText = this.ignoreConfirm ? "Continue" : "Ok";
    modalRef.componentInstance.errorDetails = data;
    if (this.ignoreConfirm) {
      modalRef.componentInstance.showBackButton = true
      modalRef.componentInstance.cancelBtnText = "Discard";
    }
    modalRef.result
      .then(() => {
        if (!this.ignoreConfirm) {
          if (data) {
            if (![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
              this.newQuilts = this.newQuilts.filter(e => {
                return data.some((item: any) => item === e.serialNumber);
              });
            } else {
              this.newQuilts;
            }

            this.newPallets = this.newPallets.filter(e => {
              return data.some((item: any) => item === e.serialNumber);
            });
            this.detailsBySerialNumber.reset();
          }
          // this.newQuilts = [];
          // this.newPallets = [];
          // this.newSerialNumber = [];
          // this.invalidQuilt = true;
          // data.forEach((item: any) => this.newSerialNumber.push(item));
          this.detailsBySerialNumber.reset();
          // this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(true)
          // this.receivePallet();
        }
        else {

          //this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(true);
          if (this.isReceiveAndCreatePallet) {
            this.receivePallet();
          }
          else {
            this.receiveQuilts();
          }
        }
        // this.receiveQuiltsForm.markAllAsTouched();
        // this.receiveQuiltsForm.markAsDirty();
      })
      .catch(() => {
        this.receiveQuiltsForm.controls.ignoreInvalidQuilts.patchValue(false)
        this.ignoreConfirm = false;
      });
  }


  openAlertModal(message: string) {
    const modalRef = this.modalService.open(AlertModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    });
    modalRef.componentInstance.message = message;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
