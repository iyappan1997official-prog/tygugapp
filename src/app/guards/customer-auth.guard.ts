import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthGuard implements CanActivateChild, CanLoad {
  public roleEnum = Roles;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guardLogic();
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guardLogic();
  }

  guardLogic(): boolean {
    const authData = this.authService.getAuthFromLocalStorage();
    const userRole = this.authService.getUserFromLocalStorage();

    const { roles, companyId } = userRole?.data || {};
    debugger
    if (authData.token && [this.roleEnum.masterAdmin, this.roleEnum.consignAdmin, this.roleEnum.consignManager, this.roleEnum.customerAdmin, this.roleEnum.serviceManager, this.roleEnum.serviceUser, this.roleEnum.globalAdmin].includes(roles[0])) {
      if (userRole?.data?.roles[0] === this.roleEnum.customerAdmin) {
        this.router.navigate(["/orders/view-orders", companyId], {
          queryParams: {
            tab: "orders"
          }
        });
      }
      return true;
    }

    this.router.navigate(["/dashboard"]);
    return false;
  }
}
