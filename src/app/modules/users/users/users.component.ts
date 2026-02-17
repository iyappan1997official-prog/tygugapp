import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { FetchUserRolesService } from 'src/app/shared/services/fetch-user-roles.service';
import { UsersService } from '../users.service';
import { AuthService } from '../../auth/auth.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthModel } from '../../auth/models/auth.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  // encapsulation:ViewEncapsulation.None
})
export class UsersComponent implements OnInit, OnDestroy {
  // data: any[] =[];
  private _items$ = new BehaviorSubject<[]>([]);
  private subscriptions: Subscription[] = [];
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  isLoading: boolean = false;
  allUserRoles: any[] = [];
  buttonClick: boolean = false;
  loggedInUserRole: Roles;
  loggedLocation: number;
  userDetails: any;
  // profileAccessRoles: string[] = [this.roleEnum.consignAdmin, this.roleEnum.consignManager, this.roleEnum.serviceManager,
  // this.roleEnum.customerAdmin, this.roleEnum.customerManager, this.roleEnum.globalAdmin];
  profileAccessRoles: string[] = [this.roleEnum.serviceManager,
  this.roleEnum.customerAdmin, this.roleEnum.customerManager, this.roleEnum.globalAdmin];
  @Output() markEditFormAsTouched = new EventEmitter();
  get items$() {
    return this._items$.asObservable();
  }
  userListForm: FormGroup;
  // paginator: PaginatorState;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10];
  SortDescendingOrder: boolean = false;
  sortByColumn: string;

  // MatPaginator Output
  pageEvent: PageEvent;

  // setPageSizeOptions(setPageSizeOptionsInput: string) {
  //   if (setPageSizeOptionsInput) {
  //     this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  //   }
  // }
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private userService: UsersService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private userRolesService: FetchUserRolesService,
    private ngbModal: NgbModal,
    private cd: ChangeDetectorRef,
    private userAuthService: AuthService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedLocation = this.authService?.getUserFromLocalStorage()?.data?.locationId || null

    this.loggedInUserRole = this.userDetails?.roles[0];
    this.initForm();
    this.fetchUserRolesService();
    this.getUsers();
    this.onSearchByValueChange();

  }

  initForm() {
    this.userListForm = this.fb.group({
      searchBy: [""],
      roleId: [''],
      locationId: [0],
      sortByColumn: "",
      SortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getUsers() {
    this.spinner.show();
    this.isLoading = true;
    if ([this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.userListForm.controls.roleId.patchValue(8)
      this.userListForm.controls.locationId.patchValue(this.loggedLocation)
    } else if ([this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.userListForm.controls.roleId.patchValue(5)
      this.userListForm.controls.locationId.patchValue(this.loggedLocation)
    } else if ([this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.userListForm.controls.roleId.patchValue(10)
      this.userListForm.controls.locationId.patchValue(this.loggedLocation)
    }
    const body = {
      ...this.userListForm.getRawValue()
    }

    const userListSub = this.userService.userListing(body).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        // this.markEditFormAsTouched.emit();
        this._items$.next(res.data);
        this.length = res.totalCount;
        this.fetchUserRolesService();
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    }, error => {
      this.isLoading = false
    })
    this.subscriptions.push(userListSub);
  };
  sort(column: string) {

    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    }
    else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    this.userListForm.patchValue({
      sortByColumn: this.sortByColumn,
      SortDescendingOrder: this.SortDescendingOrder
    });

    this.getUsers();
  }
  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removeUser(id);
    }).catch((res) => { })
  }

  removeUser(id: number) {
    this.spinner.show();
    const deleteUser = this.userService.removeUser(id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getUsers();
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
    this.unsubscribe.push(deleteUser);
  }

  confirmLoggedInAsUser(userId: string) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })
    modalRef.componentInstance.body = `Are you sure you want to logged in as user '${userId}' ?`;
    modalRef.componentInstance.title = 'Log in as user';
    modalRef.componentInstance.cancelBtnText = "No";
    modalRef.result.then(() => {
      this.loggedInAsUser(userId);
    }).catch((res) => { })
  }

  loggedInAsUser(userId: string) {
    this.spinner.show("spinner2");
    const userLoginSub = this.userService.getLoggedInAsUser(userId).subscribe((res) => {
      if (res && res.statusCode) {
        debugger
        let auth = new AuthModel();
        auth.token = res?.data?.token;
        localStorage.setItem("masterUserDetails", localStorage.getItem("userDetails"));
        localStorage.setItem("masterUserToken", localStorage.getItem("token"));
        this.authService.setAuthFromLocalStorage(auth);
        this.authService.setUserFromLocalStorage(res);
        this.authService.currentUserSubject.next(res);
        this.authService.masterUserSubject.next(localStorage.getItem("userDetails"));
        this.spinner.hide("spinner2");
        this.router.navigate(["/dashboard"]);
      } else {
        this.spinner.hide("spinner2");
      }
    })
    this.unsubscribe.push(userLoginSub);
  }
  fetchUserRolesService() {
    this.spinner.show();

    let apiCalled = false;
    const userRolesSub = this.userRolesService.allUserRoles.subscribe((userRoles) => {
      if (userRoles && userRoles.length && apiCalled) {
        this.allUserRoles = userRoles;
      } else if (!apiCalled) {
        apiCalled = true;
        this.userRolesService.getAllRoles();
      }
    })
    this.spinner.hide();
    this.unsubscribe.push(userRolesSub);
  }

  navigateToEditUser(id: any) {
    this.router.navigate(["/users/edit-user", id])
  }

  onSearchByValueChange() {
    const searchByValueSub = this.userListForm.get("searchBy").valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      this.resetPageIndex();
      this.getUsers();
    })
    this.subscriptions.push(searchByValueSub);
  }

  searchReset() {
    this.userListForm.controls.searchBy.patchValue("");
    this.userListForm.controls['pageNumber'].patchValue(1);
    this.getUsers();
  }
  resetPageIndex() {
    this.userListForm.controls.pageNumber.patchValue(1);
  }

  paginator(event: any) {
    this.pageSize = event.pageSize
    this.userListForm.controls['pageSize'].patchValue(event.pageSize);
    this.userListForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
