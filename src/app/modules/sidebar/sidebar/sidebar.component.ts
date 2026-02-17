import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { SidebarService } from '../sidebar.service'
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild('sideNav') sideNav: ElementRef;
  public roleEnum = Roles;
  userRole: Roles;
  sideNavVisible: boolean = true;
  currentUrl: string;
  quiltData: any = {};
  locationUserRoles: string[] = [this.roleEnum.customerManager];
  private unsubscribe: Subscription[] = [];
  private _items$ = new BehaviorSubject<any>({});


  get items$() {
    return this._items$.asObservable();
  }

  totalQuilt: number;
  totalLeased: number;
  totalPurchased: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) {
    router.events.subscribe((val: any) => {
      this.currentUrl = val.url;
    });
  }

  ngOnInit(): void {
    this.authService.currentUserSubject.subscribe(value => {
      if (value?.data) {
        this.userRole = value?.data.roles[0];
      } else {
        this.userRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0];
      }
    })
    this.cd.detectChanges();
    // this.userRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    // this.getTotalQuiltsData();
  }

  handleNavigation() {
    if ([this.roleEnum.masterAdmin, this.roleEnum.serviceManager, this.roleEnum.consignAdmin, this.roleEnum.consignManager, this.roleEnum.warehouseUser].includes(this.userRole)) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(["/inventory/quilts-inventory"], { queryParams: { tab: "in-stock" } })
    }
    else {
      this.router.navigate(["/inventory/quilts-inventory"])
    }

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

  // orderNumberUpdate(data: any) {
  //   let counts = {
  //     totalQuilt: data.totalNumberOfQuilts,
  //     totalLeased: data.numberOfLeasedQuilts,
  //     totalPurchased: data.numberOfPurchasedQuilts
  //   };
  //   this.updateSidebar.setUpdateCount(counts);
  // }
}
