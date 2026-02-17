import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { InventoryService } from '../inventory.service';
import { removeDuplicateSerialNumbers } from "../../../shared/ts/remove-duplicate-serial-numbers";
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { AuthService } from '../../auth/auth.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScannerModalComponent } from '../scanner-modal/scanner-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-edit-pallet-details',
  templateUrl: './edit-pallet-details.component.html',
  styleUrls: ['./edit-pallet-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditPalletDetailsComponent implements OnInit {
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
  public roleEnum = Roles;
  scan: boolean = false;
  savedPalletDetails: any = {};
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  private unsubscribe: Subscription[] = [];
  allNumbers: any[] = [];
  palletId: number = +this.activatedRoute?.snapshot?.params?.id;
  serialNumber: number | string = this.activatedRoute?.snapshot?.queryParams['pallet-serial-number'];
  tab: number | string = this.activatedRoute?.snapshot?.queryParams?.tab;
  palletDetailsForm: FormGroup;
  // detailsBySerialNumber: FormControl = new FormControl("");
  detailsBySerialNumber: FormControl = new FormControl("", [Validators.pattern(this.regexService.palletQuiltSerial)]);
  // public output: any = this.detailsBySerialNumber.value;
  output: any[] = [];
  newQuilts: any[] = [];
  loggedInUserRole: Roles;
  loggedInUserDetails: any;
  newPallets: any[] = [];
  palletSerialNumber: any[] = [];
  startShow: boolean = true;
  masterAdminRoles = [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser]
  companyRoles = [this.roleEnum.customerAdmin, this.roleEnum.customerManager];
  loggedInCustomerId: any;
  loggedInLocationId: any;

  constructor(
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public generatePdfService: GeneratePdfService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private regexService: RegexService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || "";
    this.loggedInCustomerId = userData?.companyId || "";
    this.loggedInLocationId = userData?.locationId || "";
    this.loggedInUserDetails = userData;
    // this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    // this.loggedInUserDetails = this.authService?.getUserFromLocalStorage()?.data;
    // console.log(this.loggedInUserDetails);
    if (this.companyRoles.includes(this.loggedInUserRole)) {
      this.palletDetailsForm.controls.companyId.patchValue(this.loggedInCustomerId);
      this.palletDetailsForm.controls.locationId.patchValue(this.loggedInLocationId);
    }

    if (this.masterAdminRoles.includes(this.loggedInUserRole)) {
      this.palletDetailsForm.removeControl('totalQuilts');
    }

    if (this.componentAccessFor === "create-pallet") {
      this.savedPalletDetails["quilts"] = this.inventoryService.allQuiltsToCreatePallet.getValue();
      console.log(this.savedPalletDetails["quilts"]);

      if (!this.savedPalletDetails?.quilts?.length) {
        this.navigateToIndividualStocks();
      } else {
        let { quiltStatusId, masterQuiltTypeId } = this.savedPalletDetails?.quilts[0];
        if (!quiltStatusId || quiltStatusId == 0) {
          quiltStatusId = this.savedPalletDetails?.quilts[0].statusId;
        }
        this.palletDetailsForm.patchValue({ palletStatusId: quiltStatusId, masterQuiltTypeId })
      }
      // if (!this.savedPalletDetails?.quilts?.length && this.companyRoles.includes(this.loggedInUserRole)) {
      //   this.navigateToIndividualStocks();
      // } else {
      //   const { id, palletStatusId } = this.savedPalletDetails;
      //   this.palletDetailsForm.patchValue({ id, palletStatusId });
      //   this.palletDetailsForm.controls.companyId.patchValue(this.loggedInCustomerId);
      //   this.palletDetailsForm.controls.locationId.patchValue(this.loggedInLocationId);
      // }
    } else if (this.componentAccessFor === "edit-pallet") {

      this.getPalletDetailsById();
    }


    // if (this.componentAccessFor !== "merge-pallet") {
    //   // const descriptionControl = this.palletDetailsForm.controls.description;
    //   // descriptionControl.setValidators(Validators.required);
    //   // descriptionControl.updateValueAndValidity();
    // }
    console.log(this.savedPalletDetails);

  }

  public onError(e: any): void {
    alert(e);
  }

  public handle(action: any, fn: string): void {
    // this.scan = true;
    console.log(action, fn, this.output)
    // if(fn === 'stop'){
    // this.detailsBySerialNumber.patchValue(this.output)
    //   this.spinner.show();
    //   let commaSeperatedValues = new Array();
    //   commaSeperatedValues = [this.output];
    //   const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(commaSeperatedValues).subscribe(res => {
    //     this.spinner.hide();
    //     if (res.statusCode == 200) {
    //       this.detailsBySerialNumber.reset();
    //       this.palletDetailsForm.markAsDirty();

    //       res?.data?.forEach((quilt: any) => {
    //         if (quilt.quilts === null) {
    //           this.newQuilts.push(quilt);
    //         } else {
    //           this.newPallets.push(quilt);
    //         }
    //       });
    //     } else {
    //       if (res.message) {
    //         this.toastrService.error(res.message)
    //       }
    //     }
    //   })
    //   this.unsubscribe.push(detailsBySerialNumberSub);
    // }
    action[fn]().subscribe();

    // this.startShow = false;
    // this.detailsBySerialNumber.touched;
    // this.getDetailsBySerialNumber()
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
      this.spinner.show();
      this.output = result.output;
      // this.output.length = result.output.length - 1;
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output)
      // }

      // let commaSeperatedValues = new Array();
      // commaSeperatedValues = this.detailsBySerialNumber.value.split(",");

      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(this.output, false, false).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          this.detailsBySerialNumber.reset();
          this.palletDetailsForm.markAsDirty();

          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              this.newQuilts.push(quilt);

            } else {
              this.newPallets.push(quilt);
              quilt.quilts.forEach((qui: any) => {
                this.palletSerialNumber.push(qui.serialNumber)

              })
              console.log(this.palletSerialNumber);
            }
          });
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

  get componentHeading(): string {
    const componentAccessFor = this.componentAccessFor;

    if (componentAccessFor === 'merge-pallet') {
      return 'Add Merge Pallet';
    } else if (componentAccessFor === 'create-pallet') {
      return 'Create Pallet'
    } else return 'Edit Pallet Details';
  }

  initForm() {
    this.palletDetailsForm = this.fb.group({
      id: 0,
      palletStatusId: 0,
      masterQuiltTypeId: 0,
      // description: [""],
      description: "",
      totalQuilts: 0,
      quiltSerialNumbers: [""],
      companyId: 0,
      locationId: 0
    });
  }

  patchFormvalues() {
    const palletDetails = this.savedPalletDetails || {};
    const palletDetailsForm = this.palletDetailsForm;

    if (!!palletDetails && !this.savedPalletDetails.isMockPallet) {
      palletDetailsForm.patchValue({ ...palletDetails, masterQuiltTypeId: palletDetails.quilts[0].masterQuiltTypeId });
    } else if (!!palletDetails && this.savedPalletDetails.isMockPallet) {
      palletDetailsForm.patchValue({ ...palletDetails });
    }
    this.cd.detectChanges();
  }

  getPalletDetailsById() {
    this.spinner.show();
    const palletDetailstSub = this.inventoryService.getPalletDetailsById(this.palletId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedPalletDetails = res?.data;
        // if(this.masterAdminRoles.includes(this.loggedInUserRole)){
        this.patchFormvalues();
        // }
      } else {
        // this.router.navigate(["/inventory/in-stock"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(palletDetailstSub);
  }

  getDetailsBySerialNumber() {
    if (!!this.detailsBySerialNumber.value) {
      // if (!this.detailsBySerialNumber.value) {
      //   this.detailsBySerialNumber.patchValue(this.output)
      // this.palletDetailsForm.markAsDirty()
      // }
      this.spinner.show();

      let commaSeperatedValues = new Array();
      commaSeperatedValues = this.detailsBySerialNumber.value.split(",");

      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(commaSeperatedValues, false, false).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          this.detailsBySerialNumber.reset();
          this.palletDetailsForm.markAsDirty();

          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              if (!this.newQuilts.some(x => x.id === quilt.id))
                this.newQuilts.push(quilt);

            } else {
              if (!this.newPallets.some(x => x.id === quilt.id)) {
                this.newPallets.push(quilt);
                quilt.quilts.forEach((qui: any) => {
                  this.palletSerialNumber.push(qui.serialNumber)
                })
              }
              console.log(this.palletSerialNumber);
            }
          });
        } else {
          if (res.message) {
            this.toastrService.error(res.message)
          }
        }
      })
      this.unsubscribe.push(detailsBySerialNumberSub);
    }
  }

  removeSerialNumber(array: any[], index: number, indexParentArray?: number) {
    array.splice(index, 1);
    if (!array.length && indexParentArray != undefined) {
      this.newPallets.splice(indexParentArray, 1);
    }
    this.palletDetailsForm.markAsDirty();
  }

  editPalletDetailsById() {
    const palletDetailsForm = this.palletDetailsForm;
    console.log(palletDetailsForm)

    if (palletDetailsForm.invalid || (!this.savedPalletDetails?.quilts?.length && !this.newQuilts.length && !this.newPallets.length) && !this.savedPalletDetails.isMockPallet) {
      palletDetailsForm.markAllAsTouched();
      palletDetailsForm.markAsDirty();
    }
    else if (palletDetailsForm.pristine) {
      if (this.componentAccessFor === "create-pallet") {
        this.editPalletDetails();
      }
    }

    else if (!palletDetailsForm.pristine) {
      if (this.componentAccessFor === "merge-pallet") {
        this.mergePallet();
      } else {
        this.editPalletDetails();
      }
    }
  }

  editPalletDetails() {
    this.spinner.show();
    //  if(!this.savedPalletDetails.isMockPallet){
    let quiltIds: number[] = [];
    this.savedPalletDetails?.quilts?.forEach((quilt: any) => quiltIds.push(quilt.serialNumber || quilt.quiltSerialNumber));
    const body: any = {
      ...this.palletDetailsForm.getRawValue(),
      quiltSerialNumbers: quiltIds,
      // inventories: [...this.newPallets, ...this.newQuilts]
    };

    const editPalletSub = this.inventoryService.editPalletDetails(body)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.inventoryService.allPallets.next([]);
          this.handleRoutingAfterSucessRes(res);

          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else if (res?.message) {
          this.toastrService.error(res.message);
        }
      });
    this.unsubscribe.push(editPalletSub);
    //  }
    //  else if(this.savedPalletDetails.isMockPallet){
    //   let quiltIds: number[] = [];
    //   this.savedPalletDetails?.quilts?.forEach((quilt: any) => quiltIds.push(quilt.serialNumber || quilt.quiltSerialNumber));
    //     const { quiltStatusId, masterQuiltTypeId } = this.savedPalletDetails?.quilts[0];
    //     this.palletDetailsForm.patchValue({ palletStatusId: quiltStatusId, masterQuiltTypeId })
    //     this.palletDetailsForm.controls.id.patchValue(this.savedPalletDetails.id);
    //       this.palletDetailsForm.controls.companyId.patchValue(this.loggedInCustomerId);
    //       this.palletDetailsForm.controls.locationId.patchValue(this.loggedInLocationId);
    //   const body: any = {
    //     ...this.palletDetailsForm.getRawValue(),
    //     quiltSerialNumbers: quiltIds,
    //   };

    //   const editPalletSub = this.inventoryService.editPalletDetails(body)
    //     .subscribe((res: any) => {
    //       this.spinner.hide();
    //       if (res.statusCode === 200 || res.statusCode === 201) {
    //         this.inventoryService.allPallets.next([]);
    //         this.handleRoutingAfterSucessRes(res);

    //         if (res?.message) {
    //           this.toastrService.success(res.message);
    //         }
    //       } else if (res?.message) {
    //         this.toastrService.error(res.message);
    //       }
    //     });
    //   this.unsubscribe.push(editPalletSub);
    // }
  }

  handleRoutingAfterSucessRes(res: any) {
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      const { companyName, companyNumber, orderNumber, tab } = this.activatedRoute?.snapshot?.queryParams || {};

      if (tab === "leased") {
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "leased" }
        });
      } else {
        this.navigateToViewPalletDetails(res?.data?.id);
        // this.router.navigate(["/inventory/quilts-inventory/purchased", orderNumber], {
        //   queryParams: { companyName, companyNumber }
        // })
      }
    } else {
      this.navigateToViewPalletDetails(res?.data?.id);
    }
  }

  mergePallet() {
    this.spinner.show();
    // this.ne
    const body: any = {
      id: this.palletId,
      quiltSerialNumbers: removeDuplicateSerialNumbers(this.newQuilts, this.newPallets, this.palletSerialNumber)
    };
    console.log(this.newQuilts, this.newPallets, this.palletSerialNumber)
    const mergePalletSub = this.inventoryService.mergePallet(body)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.inventoryService.allPallets.next([]);
          this.handleRouting();
          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else if (res?.message) {
          this.toastrService.error(res.message);
        }
      });
    this.unsubscribe.push(mergePalletSub);
  }

  handleRouting() {
    if (this.componentAccessFor === "create-pallet") {
      this.navigateToIndividualStocks();
    } else {
      this.navigateToViewPalletDetails();
    }
  }

  navigateToIndividualStocks() {
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      const { companyName, companyNumber, orderNumber, tab } = this.activatedRoute?.snapshot?.queryParams || {};
      if (tab === "leased") {
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "leased" }
        });
      } else {
        // this.router.navigate(["/inventory/quilts-inventory/purchased", orderNumber], {
        //   queryParams: { companyName, companyNumber }
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "purchased" }
        })
      }
    } else if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      const { tab } = this.activatedRoute?.snapshot?.queryParams || {};
      if (tab === "consignment") {
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "consignment" }
        });
      }
    } else {
      this.router.navigate(["/inventory/quilts-inventory"], {
        queryParams: {
          tab: "in-stock",
          stock: "individual"
        }
      });
    }
  }

  navigateToViewPalletDetails(palletId?: number) {
    this.router.navigate(["/inventory/quilts-inventory/pallet-details", !!palletId ? palletId : this.palletId])
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
