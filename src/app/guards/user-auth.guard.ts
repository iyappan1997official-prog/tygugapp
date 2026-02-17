import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivateChild, CanLoad {
  public roleEnum = Roles;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.guardLogic();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.guardLogic();
  }

  guardLogic(): boolean {
    const authData = this.authService.getAuthFromLocalStorage();
    const userRole = this.authService.getUserFromLocalStorage();

    if (authData.token && [this.roleEnum.masterAdmin, this.roleEnum.consignAdmin, this.roleEnum.consignManager, this.roleEnum.customerAdmin, this.roleEnum.customerManager, this.roleEnum.serviceManager, this.roleEnum.globalAdmin].includes(userRole?.data?.roles[0])) {
      return true;
    }

    this.router.navigate(["/dashboard"]);
    return false;
  }
}
