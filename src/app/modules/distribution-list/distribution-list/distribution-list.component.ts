/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { DistributionService } from '../distribution.service';

@Component({
  selector: 'app-distribution-list',
  templateUrl: './distribution-list.component.html',
  styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];

  get items$() {
    return this._items$.asObservable();
  }

  distributionListForm: FormGroup;
  totalLists: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;

  constructor(
    private distributionService: DistributionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngbModal: NgbModal
  ) { }

  ngOnInit(): void {
    this.initform();
    this.getAllDistributionList();
    this.onSearchByValueChange();
  }

  getSearchByControl() {
    return this.distributionListForm.controls.searchBy as FormControl;
  }

  initform() {
    this.distributionListForm = this.fb.group({
      searchBy: "",
      sortByColumn: 'name',
      sortAscendingOrder: "asc",
      pageNumber: 1,
      pageSize: 10
    })
  }

  getAllDistributionList() {
    this.spinner.show();
    this.isLoading = true;

    const listSub = this.distributionService.distributionListing(this.distributionListForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.distributionLists);
        this.totalLists = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(listSub);
  }

  onSearchByValueChange() {
    const { pageNumber, searchBy } = this.distributionListForm.controls;
    const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      pageNumber.patchValue(1);
      this.getAllDistributionList();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.distributionListForm.controls.searchBy.patchValue("");
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.distributionListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllDistributionList();
  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removeList(id);
    }).catch((res) => { })
  }

  removeList(id: number) {
    this.spinner.show();
    const deleteList = this.distributionService.removeList(id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getAllDistributionList();

          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deleteList);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}*/

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { DistributionService } from '../distribution.service';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-distribution-list',
  templateUrl: './distribution-list.component.html',
  styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnInit {
  private _items$ = new BehaviorSubject<any[]>([]);
  items$ = this._items$.asObservable();
  private unsubscribe: Subscription[] = [];

  // 🔹 Data shown in the table
  items: any[] = [];
  totalLists: number = 0;
  distributionListForm: FormGroup;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;

  constructor(
    private distributionService: DistributionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngbModal: NgbModal,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initform();
    this.getAllDistributionList();
    this.onSearchByValueChange();
  }

  initform() {
    this.distributionListForm = this.fb.group({
      searchBy: [""],
      pageNumber: [1],
      pageSize: [10],
      sortByColumn: "",
      SortDescendingOrder: false,
    });
  }

  getSearchByControl() {
    return this.distributionListForm.controls.searchBy as FormControl;
  }

  getAllDistributionList() {
    this.isLoading = true;

    const sub = this.distributionService
      .distributionListing(this.distributionListForm.getRawValue())
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this._items$.next(res?.data?.distributionLists || []);
          this.totalLists = res?.data?.totalCount || 0;
        } else {
          this._items$.next([]);
          if (res.message) {
            this.toastr.error(res.message);
          }
        }

        this.isLoading = false;
        this.cd.detectChanges();
      });

    this.unsubscribe.push(sub);
  }

  sort(column: string) {

    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    }
    else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    this.distributionListForm.patchValue({
      sortByColumn: this.sortByColumn,
      SortDescendingOrder: this.SortDescendingOrder
    });

    this.getAllDistributionList();
  }

  onSearchByValueChange() {
    const { pageNumber, searchBy } = this.distributionListForm.controls;
    const sub = searchBy.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(() => {
        pageNumber.patchValue(1);
        this.getAllDistributionList();
      });
    this.unsubscribe.push(sub);
  }

  searchReset() {
    this.distributionListForm.controls.searchBy.patchValue("");
    this.distributionListForm.controls['pageNumber'].patchValue(1);
    this.getAllDistributionList();
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.distributionListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);
    this.getAllDistributionList();
  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    });

    modalRef.result.then(() => {
      this.removeList(id);
    }).catch(() => { });
  }

  removeList(id: number) {
    this.spinner.show();
    const sub = this.distributionService.removeList(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.getAllDistributionList();
          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.unsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
