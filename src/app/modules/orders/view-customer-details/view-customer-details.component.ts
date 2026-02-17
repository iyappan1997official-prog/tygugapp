import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, forkJoin, of, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CustomersService } from '../../customers/customers.service';
import { SidebarService } from '../../sidebar/sidebar.service';
import { CloseOrderModalComponent } from '../close-order/close-order-modal/close-order-modal.component';
import { ArchiveModalComponent } from '../modal/archive-modal/archive-modal.component';
import { ReconsileModalComponent } from '../modal/archive-modal/reconsile-modal/reconsile-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';
import { OrderNickNameComponent } from '../modal/order-nick-name/order-nick-name.component';

@Component({
  selector: 'view-orders',
  templateUrl: './view-customer-details.component.html',
  styleUrls: ['./view-customer-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewCustomerDetailsComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  customerId: string = this.activatedRoute?.snapshot?.params?.id;
  // customerNameFromList: string = this.activatedRoute?.snapshot?.queryParams?.customerName;
  // customerNumberFromList: string = this.activatedRoute?.snapshot?.queryParams?.customerNumber;
  customerNameFromList: any;
  customerNumberFromList: any;
  isEpicore: any = this.activatedRoute?.snapshot?.queryParams?.isEpicore
  allOrders: any[] = [];
  orderNames: any[] = [];
  customerDetails: any;
  // customerName: string;
  // customerNumber: string;
  loggedInUserRole: Roles;
  orderId: number;
  @Input() customerName: string;
  @Input() customerNumber: string;
  @ViewChild(MatPaginator) paginators: MatPaginator;
  get items$() {
    return this._items$.asObservable();
  }
  quiltData: any = {};
  orderList: FormGroup;
  totalLists: number;
  pageSizeOptions: number[] = [1, 3, 5, 10];
  isLoading: boolean = false;
  // pageEvent: PageEvent;

  constructor(
    private customersService: CustomersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private sidebarService: SidebarService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";

    this.initform();
    console.log(this.dataSharingService.data);

    this.customerNameFromList = this.dataSharingService.data['customerName'];
    this.customerNumberFromList = this.dataSharingService.data['customerNumber'];

    if (this.tab === "orders" || !this.tab) {
      
      // this.getAllOrders();
      // this.getOrderNames();
      this.getOrdersData();
    }
  }
getOrdersData(){
  let fetchData = [this.customersService.getAllOrders(this.orderList.getRawValue(), +this.customerId).pipe(catchError(error => of(error)))];
  if([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)){
    fetchData.push(this.customersService.getOrderNames().pipe(catchError(error => of(error))));
  }
  
      this.spinner.show();
      forkJoin(fetchData).subscribe({
        next: ([res1,res2]) => {
          if(res2){
          if (res2.statusCode === 200) {
            this.orderNames = res2?.data;
          } else if (res2.message) {
            this.toastr.error(res2.message)
          }
        }
          if (res1.statusCode === 200) {
            this._items$.next(res1?.data?.orders);
            this.totalLists = res1?.data?.totalCount;
          } else if (res1.message) {
            this.toastr.error(res1.message)
          }
        },
        error: (e) => this.toastr.error(e.message),
        complete: () => { this.spinner.hide();}
      });
}
  initform() {
    this.orderList = this.fb.group({
      pageNumber: 1,
      pageSize: 3,
      totalCount: 0,
    })
  }

  getAllOrders() {
    this.spinner.show();

    const customerListSub = this.customersService.getAllOrders(this.orderList.getRawValue(), +this.customerId).subscribe((res) => {
      
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.orders);
        this.totalLists = res?.data?.totalCount;
        // this.customerName = res?.data?.customerName;
        // this.customerNumber = res?.data?.customerNumber;

      } else {
        // this.allOrders = [];
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
      this.spinner.hide();
    })
    this.unsubscribe.push(customerListSub);
  }

  getTotalQuiltsData() {
    let apiCalled = false;
    const getUpdateNumbers = this.sidebarService.sidebarNumbers.subscribe((sidebarNumbers) => {
      if (sidebarNumbers.length || apiCalled) {
        this.quiltData = sidebarNumbers;
      } else if (!apiCalled) {
        apiCalled = true;
        this.sidebarService.getTotalQuiltsCounts();
      }
    })
    this.unsubscribe.push(getUpdateNumbers);
  }

  openArchiveModal() {
    const modalRef = this.modalService.open(ArchiveModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })
    modalRef.componentInstance.orderList = +this.customerId;
    modalRef.result.then((data) => {
      if (data) {
        this.spinner.show();
        this.callArchiveCustomer(+this.customerId, this.customerDetails);
      }
    }).catch((res) => { })
  }

  openDeleteModal(id: number) {
    const modalRef = this.modalService.open(CloseOrderModalComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })
    modalRef.componentInstance.orderList = +this.customerId;
    modalRef.result.then(() => {
      this.removeOrder(+this.customerId, id)
    }).catch((res) => { })
  }

  callArchiveCustomer(id: number, body: any) {
    this.spinner.show();
    const archiveCustomer = this.customersService.archiveCustomer(id, body).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.router.navigate(["../../customers/customer"]);
      } else {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(archiveCustomer);
  }

  removeOrder(cusId: number, id: number) {
    this.spinner.show();

    const deleteList = this.customersService.removeOrder(cusId, id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getOrdersData();
          // this.getTotalQuiltsData();
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

  getOrderNames() {
    // this.spinner.show();

    const nameListSub = this.customersService.getOrderNames().subscribe((res) => {
      // this.spinner.hide();
      if (res.statusCode === 200) {
        this.orderNames = res.data;
      } else {
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(nameListSub);
  }

  editModal(orderId: number, nickId: number) {
    const modalRef = this.modalService.open(OrderNickNameComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })

    modalRef.componentInstance.id = orderId;
    modalRef.componentInstance.orderNames = this.orderNames;
    modalRef.componentInstance.editNickNameId = nickId;
    modalRef.result.then((resObject) => {
      // this.spinner.show();
      this.addOrderName(resObject)
      // this.spinner.hide();
    }).catch((res) => { })
  }


  openNameModal(id: number) {
    const modalRef = this.modalService.open(OrderNickNameComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })

    modalRef.componentInstance.id = id;
    modalRef.componentInstance.orderNames = this.orderNames;
    modalRef.result.then((resObject) => {
      // this.spinner.show();
      this.addOrderName(resObject)
      // this.spinner.hide();
    }).catch((res) => { })
  }

  openReconsileModal(id: number) {
    const modalRef = this.modalService.open(ReconsileModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })
    // this.orderId = id;
    // console.log(this.orderId);
    modalRef.componentInstance.id = id;
    modalRef.result.then(() => {
      this.getOrdersData();

    }).catch((res) => { })
  }
  addOrderName(obj: any) {
    this.spinner.show();
    const addNameSub = this.customersService.addOrderName(obj)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (res?.message) {      
            this.getOrdersData();
            this.toastr.success(res.message);
          }
        } else if (res?.message) {
          this.toastr.error(res.message);
        }
        // 
      });
    
    this.unsubscribe.push(addNameSub);
  }
  paginator(event: any) {
    const { pageSize, pageNumber, hasNext, hasPrevious } = this.orderList.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllOrders();
  }

  detalscehcl(customerId: any) {
    console.log(customerId);

  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
