import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../modules/auth/auth.service';
import { Roles } from '../shared/roles/rolesVar';

@Injectable({
  providedIn: 'root'
})
export class EditOrderGuard implements CanActivate, CanLoad {
  public roleEnum = Roles;
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guardLogic(route);
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guardLogic(route);
  }

  guardLogic(route: any): boolean {
    const userData = this.authService.getUserFromLocalStorage()?.data || {};

    if (userData?.roles[0] === this.roleEnum.masterAdmin) {
      return true;
    } else {
      if (["add-order", "edit-order", "edit-customer"].includes(route?.data?.componentAccessFor)) {
        this.router.navigate(["/orders/view-orders", userData?.companyId], {
          queryParams: { tab: "orders" }
        });
      } else {
        this.router.navigate(["/orders/view-orders", userData?.companyId], {
          queryParams: { tab: "carrier" }
        });
      }

      return false;
    }
  }
}
