import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, forkJoin, of, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { RegexService } from 'src/app/shared/services/regex.service';
import { InventoryService } from '../../inventory.service';
import * as FileSaver from 'file-saver';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { SidebarService } from 'src/app/modules/sidebar/sidebar.service';
import { UsersService } from 'src/app/modules/users/users.service';
import { AuthService } from 'src/app/modules/auth/auth.service';

@Component({
  selector: 'app-generate-serial-number',
  templateUrl: './generate-serial-number.component.html',
  styleUrls: ['./generate-serial-number.component.scss'],
})
export class GenerateSerialNumberComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private _items$ = new BehaviorSubject<any[]>([]);
  allPartNumbers: any[] = [];
  allTypes: any[] = [];
  allConstruction: any[] = [];
  allSize: any[] = [];
  totalCount: number;
  generateSerialNoForm: FormGroup;
  pageSizeOptions: number[] = [5, 10, 50];
  regionSelected: FormGroup;
  paginatorForm: FormGroup;
  searchText: string = undefined;
  private unsubscribe: Subscription[] = [];
  quiltData: any = {};
  alllocations: any[] = [];
  allCompanyRegions: any[] = [];
  getPartNumber: string;
  editMaxQuilt: boolean = false;
  loggedInLocationId: number;
  loggedInRegionId: number;

  get formValues(): any {
    return this.generateSerialNoForm.getRawValue();
  }

  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private quiltService: InventoryService,
    private regexService: RegexService,
    private fb: FormBuilder,
    private ngbModal: NgbModal,
    private usersService: UsersService,
    public generatePdfService: GeneratePdfService,
    private inventoryService: InventoryService,
    private sidebarService: SidebarService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInLocationId = userData?.locationId || 0;
    this.loggedInRegionId = userData?.regionId || 0;

    this.initForm();
    // this.getQuiltDefinition();
    this.generateSerialNoForm.controls['seriesStartNumber'].disable();
    this.fetchData();
    this.getCompanyRegions()
    this.regionSelected.controls.regionId.patchValue(+this.loggedInRegionId)
    this.getLocationsByRegion(this.loggedInRegionId)
    this.generateSerialNoForm.controls.locationId.patchValue(+this.loggedInLocationId)
  }

  fetchData() {
    let fetchData = [this.quiltService.getPartNumbers().pipe(catchError(error => of(error)))];


    fetchData.push(this.quiltService.quiltDefinitionListing().pipe(catchError(error => of(error))));
    fetchData.push(this.quiltService.quiltConstructionListing().pipe(catchError(error => of(error))));
    fetchData.push(this.quiltService.quiltSizeListing().pipe(catchError(error => of(error))));
    fetchData.push(this.quiltService.getQuiltSeries(this.paginatorForm.getRawValue()).pipe(catchError(error => of(error))));



    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: (results) => {
        console.log(results)
        if (results[0]) {
          if (results[0].statusCode === 200) {
            this.allPartNumbers = results[0]?.data;
          }
          else {
            this.allPartNumbers = [];
            if (results[0].message) {
              this.toastr.error(results[0].message);
            }
          }
        }
        // else if (results[0].message) {
        //   this.toastr.error(results[0].message)
        // }
        if (results[1]) {
          if (results[1].statusCode === 200) {
            this.allTypes = results[1]?.data;
          }
          else {
            this.allTypes = [];
            if (results[1].message) {
              this.toastr.error(results[1].message);
            }
          }
        }
        // else if (results[1].message) {
        //   this.toastr.error(results[1].message)
        // }
        if (results[2]) {
          if (results[2].statusCode === 200) {
            this.allConstruction = results[2]?.data;
          }
          else {
            this.allConstruction = [];
            if (results[2].message) {
              this.toastr.error(results[2].message);
            }
          }
        }
        // else if (results[2].message) {
        //   this.toastr.error(results[2].message)
        // }
        if (results[3]) {
          if (results[3].statusCode === 200) {
            this.allSize = results[3]?.data;
          }
          else {
            this.allSize = [];
            if (results[3].message) {
              this.toastr.error(results[3].message);
            }
          }
        }
        // else if (results[3].message) {
        //   this.toastr.error(results[3].message)
        // }

        if (results[4]) {
          if (results[4].statusCode === 200) {
            this._items$.next(results[4]?.data?.inventoryDetails);
            this.totalCount = results[4]?.data?.totalCount;
          } else {
            this._items$.next([]);
            if (results[4].message) {
              this.toastr.error(results[4].message)
            }
          }
        }
      },
      error: (e) => this.toastr.error(e.message),
      complete: () => { this.spinner.hide() }
    });

  }

  initForm() {
    this.generateSerialNoForm = this.fb.group({
      partNumberId: ['', [Validators.required]],
      partNumber: [''],
      quiltTypeId: ['', [Validators.required]],
      quiltConstructionId: ['', [Validators.required]],
      quiltSizeId: ['', [Validators.required]],
      weight: [
        '',
        [
          Validators.required,
          Validators.max(999999),
          Validators.pattern(this.regexService.nonZeroPositiveDecimalDigit),
        ],
      ],
      seriesStartNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(this.regexService.alphaNumerical),

        ],
      ],
      quantity: ['', [Validators.required, Validators.min(1)]],
      quiltTypeIdForOrder: 0,
      maxQuilts: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      locationId: [0, [Validators.required]],
      customerFacingDescription: ['']
    });

    this.paginatorForm = this.fb.group({
      pageNumber: 1,
      pageSize: 10,
    });
    this.regionSelected = this.fb.group({
      regionId: 0
    })
  }

  getQuiltDefinition() {
    this.spinner.show();

    const quiltDef = this.quiltService
      .quiltDefinitionListing()
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this.allTypes = res.data;
          this.getQuiltConstruction();
        } else {
          this.allTypes = [];
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(quiltDef);
  }

  getQuiltConstruction() {
    this.spinner.show();

    const quiltCons = this.quiltService
      .quiltConstructionListing()
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this.allConstruction = res.data;
          this.getQuiltSize();
        } else {
          this.allConstruction = [];
          this.spinner.hide();

          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(quiltCons);
  }

  getQuiltSize() {
    this.spinner.show();

    const quiltSize = this.quiltService.quiltSizeListing().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allSize = res.data;
        this.getPartNumbers();
      } else {
        this.spinner.hide();
        this.allSize = [];

        if (res.message) {
          this.toastr.error(res.message);
        }
      }
    });
    this.subscriptions.push(quiltSize);
  }

  getQuiltSeries(fetchPartNumbers: boolean = false) {
    this.spinner.show();

    const quiltSeriesSub = this.quiltService
      .getQuiltSeries(this.paginatorForm.getRawValue())
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this._items$.next(res?.data?.inventoryDetails);
          this.totalCount = res?.data?.totalCount;

          if (!!fetchPartNumbers) {
            this.getPartNumbers(false);
          } else {
            this.spinner.hide();
          }
        } else {
          this._items$.next([]);
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(quiltSeriesSub);
  }

  getPartNumbers(fetchQuiltsSeries: boolean = true) {
    this.spinner.show();

    const partNumbersSub = this.quiltService
      .getPartNumbers()
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this.allPartNumbers = res?.data;

          if (!!fetchQuiltsSeries) {
            this.getQuiltSeries();
          } else {
            this.spinner.hide();
          }
        } else {
          this.spinner.hide();
          this.allPartNumbers = [];
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(partNumbersSub);
  }

  getLocationsByRegion(id: number) {
    this.spinner.show();
    const locationSub = this.usersService.getLocationByRegion(+id).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }

  getCompanyRegions() {
    this.spinner.show()
    const companyNames = this.usersService.getCompaniesRegion().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCompanyRegions = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(companyNames);
  }

  partNumberMappedData(id: number) {
    const { partNumberId, quantity, partNumber, quiltTypeId, quiltConstructionId, quiltSizeId, weight, seriesStartNumber, maxQuilts, description, locationId, customerFacingDescription } = this.generateSerialNoForm.controls;
    if (id == 0) {
      partNumber.reset(); quiltTypeId.reset(); quiltConstructionId.reset(); quiltSizeId.reset(); weight.reset(); seriesStartNumber.reset(); quantity.reset(); maxQuilts.reset(); description.reset(); customerFacingDescription.reset();
      this.generateSerialNoForm.enable();
      this.generateSerialNoForm.controls['seriesStartNumber'].disable();
      this.generateSerialNoForm.controls['seriesStartNumber'].patchValue('0000');
    }
    else if (id > 0) {
      this.spinner.show();
      this.editMaxQuilt = true;
      const mappedDataSub = this.quiltService
        .getInventoryMappingByPartNumber(id)
        .subscribe((res) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.generateSerialNoForm.patchValue(res?.data);
            this.getPartNumber = res?.data?.partNumber;
            this.generateSerialNoForm.disable();
            partNumberId.enable();
            quantity.enable();
            quantity.reset('');
            maxQuilts.enable();
            // maxQuilts.reset('')
            description.enable();
            locationId.enable();
            customerFacingDescription.enable()
            if (!locationId.value) {
              locationId.patchValue(this.loggedInLocationId)
            }
          } else if (res.message) {
            this.toastr.error(res.message);
          }
        });
      this.subscriptions.push(mappedDataSub);
    } else {
      this.generateSerialNoForm.enable();
      this.generateSerialNoForm.reset({
        partNumberId: 0,
      });
    }
    this.validatePartNumberField();
  }

  validatePartNumberField() {
    const { partNumberId, partNumber } = this.generateSerialNoForm.controls;
    if (partNumberId.value === 0) {
      partNumber.setValidators([
        Validators.required,
        Validators.pattern(this.regexService.alphaNumerical),
      ]);
    } else {
      partNumber.clearValidators();
    }

    partNumber.updateValueAndValidity();
  }

  openConfirmDeleteModal(id: any) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.title = 'Delete QR Code';
    modalRef.componentInstance.body =
      'Are you sure you want to delete this QR Code?.';
    modalRef.componentInstance.summarytext = 'You need to regenerate new QR Code';


    modalRef.result.then(() => {
      this.removeQrCode(id);
    }).catch((res) => { })
  }

  removeQrCode(id: number) {
    this.spinner.show();
    const deleteQrCode = this.inventoryService.deleteQrCodeFile(id)
      .subscribe((res: any) => {
        this.spinner.hide()
        if (res.statusCode === 200) {
          // this.getQuiltSeries();
          // if (res.message) {
          this.toastr.success(res.message);
          // }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deleteQrCode);
  }


  paginator(event: any) {
    this.paginatorForm.controls['pageSize'].patchValue(event.pageSize);
    this.paginatorForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltSeries();
  }

  generateSeries() {
    const generateSerialNoForm = this.generateSerialNoForm;

    if (generateSerialNoForm.invalid) {
      generateSerialNoForm.markAllAsTouched();
    } else if (!this.generateSerialNoForm.pristine) {
      if (+generateSerialNoForm.controls.quantity.value > 500) {
        this.openConfirmationModal();
      } else {
        this.callGenerateSeriesApi();
      }
    }
  }

  editGenerateSeries() {
    this.spinner.show();
    const generateSeriesSub = this.inventoryService.editSerialNumber(this.getPartNumber, +this.generateSerialNoForm.controls['maxQuilts'].value, this.generateSerialNoForm.controls['customerFacingDescription'].value)
      .subscribe((res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.initForm();
          this.generateSerialNoForm.controls['seriesStartNumber'].disable();
          this.getQuiltSeries(true);
          this.getTotalQuiltsData();
          this.allCompanyRegions = []
          this.ngOnInit()
          if (res?.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res?.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(generateSeriesSub);

  }

  openConfirmationModal() {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Confirmation';
    modalRef.componentInstance.body =
      'The entered quantity is more than 500, so it might take a while.';
    modalRef.componentInstance.summarytext = 'Do you want to continue?';
    modalRef.componentInstance.confirmBtnText = 'Continue';

    modalRef.result
      .then(() => {
        this.callGenerateSeriesApi();
      })
      .catch((res) => { });
  }

  callGenerateSeriesApi() {
    this.spinner.show();
    const generateSerialNoForm = this.generateSerialNoForm;
    const body = {
      ... this.formValues,
      maxQuilts: +generateSerialNoForm.controls.maxQuilts.value,
      quantity: +generateSerialNoForm.controls.quantity.value
    }
    const generateSeriesSub = this.quiltService
      .generateSerialNumbers(body)
      .subscribe((res: any) => {
        this.generateSerialNoForm.markAsPristine();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.initForm();
          this.generateSerialNoForm.controls['seriesStartNumber'].disable();
          this.getQuiltSeries(true);
          this.getTotalQuiltsData();
          this.allCompanyRegions = []
          this.ngOnInit()
          if (res?.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res?.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(generateSeriesSub);
  }

  getTotalQuiltsData() {
    let apiCalled = false;
    const getAllLoc = this.sidebarService.sidebarNumbers.subscribe((sidebarNumbers) => {
      if (sidebarNumbers.length || apiCalled) {
        this.quiltData = sidebarNumbers;
      } else if (!apiCalled) {
        apiCalled = true;
        this.sidebarService.getTotalQuiltsCounts();
      }
    })
    this.unsubscribe.push(getAllLoc);
  }

  exportInExcel(id: number, quiltSeriesStart: string, quiltSeriesEnd: string) {
    this.spinner.show();
    const exportExcel = this.inventoryService
      .exportInExcel(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if ([200, 201].includes(res.statusCode)) {
          const byteArray: any = new Uint8Array(atob(res.data).split('').map((char) => char.charCodeAt(0)));
          let blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          FileSaver.saveAs(blob, `${quiltSeriesStart}-${quiltSeriesEnd}.xlsx`);
        } else if (res.message) {
          this.toastr.error(res.message);
        }
      });
    this.unsubscribe.push(exportExcel);
  }
}
