import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { FetchQuiltTypesService } from 'src/app/shared/services/fetch-quilt-types.service';
import { AssignQuiltModalComponent } from '../assign-quilt-modal/assign-quilt-modal.component';
import { InventoryService } from '../inventory.service';
import { UpdateStatusModalComponent } from '../update-status-modal/update-status-modal.component';
import { GeneratePdfService } from "../../../shared/services/generate-pdf.service";
import { AuthService } from '../../auth/auth.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { FetchPalletStatusService } from 'src/app/shared/services/fetch-pallet-status.service';

@Component({
  selector: 'app-pallet-details',
  templateUrl: './pallet-details.component.html',
  styleUrls: ['./pallet-details.component.scss']
})
export class PalletDetailsComponent implements OnInit {
  public roleEnum = Roles;
  savedPalletDetails: any = {};
  private unsubscribe: Subscription[] = [];
  palletId: number = this.activatedRoute?.snapshot?.params?.id;
  palletIds: number[] = []
  pallets: any[] = [];
  palletLength: number;
  stocksDataForm: FormGroup;
  alltypes: any[] = [];
  allStatus: any[] = [];
  masterAdminRoles: string[] = [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser];
  loggedInUserRole: Roles;

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private inventoryService: InventoryService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private quiltTypesService: FetchQuiltTypesService,
    private authService: AuthService,
    public generatePdfService: GeneratePdfService,
    private quiltStatusesService: FetchQuiltStatusesService,
    private palletStatusesService: FetchPalletStatusService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";

    this.getPalletDetailsById();
    this.fetchQuiltTypes();
  }

  initForm() {
    this.stocksDataForm = this.fb.group({
      quiltTypeId: 0,
      inventoryStatusId: 0,
      searchBy: "",
      pageNumber: 1,
      pageSize: 10
    })
  }


  get formValues(): any {
    return this.stocksDataForm.getRawValue();
  }

  handleRouting() {
    if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.router.navigate(["inventory", "quilts-inventory"], {
        queryParams: { tab: "pallet" }
      })
    } else if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.router.navigate(["inventory", "quilts-inventory"], {
        queryParams: { tab: "in-stock" }
      })
    } else {
      this.router.navigate(["inventory", "quilts-inventory"], {
        queryParams: { tab: 'in-stock', stock: 'pallet' },
      })
    }
  }

  fetchQuiltTypes() {
    this.spinner.show();

    let apiCalled = false;
    const quiltTypesSub = this.quiltTypesService.quiltTypes.subscribe((types) => {
      if (types.length || apiCalled) {
        this.alltypes = types;
        // this.fetchQuiltStatuses();
        this.fetchPalletStatuses()
      } else if (!apiCalled) {
        apiCalled = true;
        this.quiltTypesService.getQuiltTypes();
      }
    })
    this.unsubscribe.push(quiltTypesSub);
  }
  fetchPalletStatuses() {
    let apiCalled = false;
    const quiltStatusSub = this.palletStatusesService.allPalletStatuses.subscribe((allstatus) => {
      if (allstatus.length || apiCalled) {
        this.allStatus = allstatus;
      } else if (!apiCalled) {
        apiCalled = true;
        this.palletStatusesService.getPalletStatuses();
      }
    })
    this.unsubscribe.push(quiltStatusSub);
  }
  fetchQuiltStatuses() {
    // this.spinner.show();

    let apiCalled = false;
    const quiltStatusSub = this.quiltStatusesService.allQuiltStatuses.subscribe((allstatus) => {
      // this.spinner.hide()
      if (allstatus.length || apiCalled) {
        this.allStatus = allstatus;
        // this.getPalletStockData();
      } else if (!apiCalled) {
        apiCalled = true;
        this.quiltStatusesService.getQuiltStatuses();
      }
    })
    this.unsubscribe.push(quiltStatusSub);
  }

  getPalletDetailsById() {
    this.spinner.show();
    const palletDetailstSub = this.inventoryService.getPalletDetailsById(+this.palletId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedPalletDetails = res?.data;
      } else {
        this.router.navigate(["/inventory/in-stock"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(palletDetailstSub);
  }

  getPalletStockData() {
    this.spinner.show();

    const palletInStockSub = this.inventoryService.getPallets(this.formValues).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.pallets = res?.data?.pallets;
        this.palletLength = res?.data?.totalCount;
      } else {
        this.pallets = [];

        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(palletInStockSub);
  }

  callAssignPalletsApi({ orderNumber, palletIds = [], quiltIds = [] }: any) {
    const assignPalletsSub = this.inventoryService.assignQuiltsToCustomer({ orderNumber, palletIds, quiltIds }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200 || res.statusCode === 201) {
        // this.getPalletStockData();
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "in-stock", stock: 'pallet' }
        });
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(assignPalletsSub);
  }

  updatePalletStatusApi(event: any) {
    this.toastrService.error("Pallet status update is disabled.");
    return;
    const updatePalletStatusSub = this.inventoryService.updatePalletStatus(event).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200 || res.statusCode === 201) {
        // this.getPalletStockData();
        this.router.navigate(["/inventory/quilts-inventory"], {
          queryParams: { tab: "in-stock", stock: 'pallet' }
        });
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(updatePalletStatusSub);
  }

  assignPalletsToCustomer() {
    if (this.savedPalletDetails.palletStatus !== "On Hand") {
      this.toastrService.error('Only pallets with the "On Hand" status can be assigned to customers.')
    }
    else {
      const modalRef = this.modalService.open(AssignQuiltModalComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });

      let quiltIds: number[] = [];
      let palletIds: string[] | number[] = [this.palletId];
      this.savedPalletDetails?.quilts?.forEach((quilt: any) => quiltIds.push(quilt.id));
      modalRef.componentInstance.palletsAssigned = 1;
      modalRef.componentInstance.quiltsAssigned = this.savedPalletDetails.totalQuilts;
      modalRef.componentInstance.componentAccessFor = "Pallets";
      modalRef.result.then(({ orderNumber }) => {
        this.spinner.show();
        // this.assignQuilts.emit({ orderNumber, palletIds:this.palletIds });
        this.callAssignPalletsApi({ orderNumber, palletIds })
      }).catch((res) => { })
    }
  }

  updatePalletStatus() {
    // Block pallet update
    this.toastrService.error("Pallet status update is disabled.");
    return;
    const modalRef = this.modalService.open(UpdateStatusModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    });

    let palletIds: string[] | number[] = [this.palletId];
    modalRef.componentInstance.allStatus = this.allStatus;

    modalRef.result.then((resObject) => {
      this.spinner.show();
      const { quiltStatusId, retiredStatusId, quiltRepairTypes } = resObject;
      this.spinner.hide();
      this.updatePalletStatusApi({ palletStatusId: quiltStatusId, retiredStatusId, quiltRepairTypes,palletIds });
    }).catch((res) => { })
  }



  openConfirmDeleteModal(palletId: number) {
    const modalRef = this.modalService.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removePallet(palletId);
    }).catch((res) => { })
  }

  removePallet(palletId: number) {
    this.spinner.show();
    const deletePallet = this.inventoryService.removePallet(palletId)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.router.navigate(["/inventory/quilts-inventory"], {
            queryParams: { tab: "in-stock", stock: 'pallet' }
          })
          if (res.message) {
            this.toastrService.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastrService.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deletePallet);
  }
}
