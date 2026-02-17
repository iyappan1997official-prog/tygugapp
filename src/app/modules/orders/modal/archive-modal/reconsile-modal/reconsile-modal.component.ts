import { ChangeDetectionStrategy } from '@angular/compiler';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { CustomersService } from 'src/app/modules/customers/customers.service';
import { FetchReconcileQuiltStatusService } from 'src/app/shared/services/fetch-reconcile-quilt-status.service'

@Component({
  selector: 'app-reconsile-modal',
  templateUrl: './reconsile-modal.component.html',
  styleUrls: ['./reconsile-modal.component.scss']
})
export class ReconsileModalComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  @Input() id: number;
  private unsubscribe: Subscription[] = [];
  customerNo: any;
  orderNo: any;
  alltypes: any[] = [];
  isLoading: boolean = false;
  reconcileForm: FormGroup;
  componentAccessFor: any = "edit-order"
  allStatus: any[] = [{ id: 1, name: "CQ28" }];
  updateReconcil: any[] = [];
  reconcileOption: string[] = ['Active', 'Damaged', 'Lost', 'Retired', 'Inactive']
  get items$() {
    return this._items$.asObservable();
  }
  constructor(public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fetchReconcileStatusService: FetchReconcileQuiltStatusService,
    private customersService: CustomersService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchQuiltTypes();
    // this.getReconcileQuilts();
  }

  initForm() {
    this.reconcileForm = this.fb.group({
      quiltId: 0,
      quiltSerialNumber: '',
      quiltStatusId: [0, Validators.required],
      quiltStatus: '',
      notes: ''
    });
  }

  getReconcileQuilts() {
    this.spinner.show();

    const reconcileQuilts = this.customersService.getQuiltsForReconcile(this.id).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.reconciledQuilts);
        this.customerNo = res.data.customerNumber;
        this.orderNo = res.data.orderNumber;
      }
      else {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(reconcileQuilts);
    // this.enableEditListFields();
  }

  quiltStatusChange(event?: any, quilt?: any) {
    quilt.quiltStatusId = event.value;
    quilt.quiltStatus = this.alltypes.find(x => x.id == quilt.quiltStatusId).name;
    let searchQuilt = this.updateReconcil.find(x => x.quiltId == quilt.quiltId);
    if (searchQuilt) {
      //update
      searchQuilt = quilt;
    } else {
      //push object
      this.updateReconcil.push(quilt);
    }

  }
  quiltUpdateNotes(event: any, quilt: any) {
    quilt.notes = event.target.value;
    let searchQuilt = this.updateReconcil.find(x => x.quiltId == quilt.quiltId);
    if (searchQuilt) {
      //update
      searchQuilt = quilt;
    } else {
      //push object
      this.updateReconcil.push(quilt);
    }
  }

  saveChanges() {
    this.addReconcile(this.updateReconcil)
    // return this.modal.close(this);
  }

  addReconcile(newValue: any) {
    this.spinner.show();

    const addReconcile = this.customersService.addReconcile(newValue).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        if (res?.message) {
          this.toastr.success(res.message);
          this.modal.close(this)
        }
      } else if (res?.message) {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(addReconcile);
  }

  enableEditListFields() {
    const reconcileForm = this.reconcileForm;
    const { quiltStatus } = reconcileForm.controls;
    reconcileForm.disable();

    quiltStatus.enable();
  }

  fetchQuiltTypes() {
    this.spinner.show();

    let apiCalled = false;
    const quiltTypesSub = this.fetchReconcileStatusService.reconcileQuiltTypes.subscribe((types) => {
      if (types.length || apiCalled) {
        this.alltypes = types;
        if (this.componentAccessFor === "edit-order") {
          this.getReconcileQuilts();
        } else {
          this.spinner.hide();
        }
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchReconcileStatusService.getQuiltTypes();
      }
    })
    this.unsubscribe.push(quiltTypesSub);
  }

}
